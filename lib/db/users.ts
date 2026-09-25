import type { User, UserAddress } from './types';
import type { Db } from './pool';

export async function getUserByIdentifier(db: Db, identifier: string): Promise<User | undefined> {
  const pool = db.pgPool;
  if (!pool) return undefined;
  try {
    const res = await pool.query(
      `SELECT * FROM public.users WHERE LOWER(identifier) = LOWER($1)`,
      [identifier]
    );
    if (res.rows.length === 0) return undefined;
    const r = res.rows[0];
    return {
      id: r.id,
      identifier: r.identifier,
      name: r.name,
      email: r.email,
      phone: r.phone,
      address: r.address,
      city: r.city,
      state: r.state,
      zipCode: r.zip_code,
      password: r.password,
      role: r.role,
      createdAt: r.created_at,
    };
  } catch (err: any) {
    console.warn('⚠️ PG getUserByIdentifier error:', err.message);
    return undefined;
  }
}

export async function findOrCreateUser(db: Db, identifier: string, name?: string, password?: string): Promise<User> {
  const pool = db.pgPool;
  if (!pool) {
    return {
      id: `usr-${Date.now()}`,
      identifier,
      name: name || identifier.split('@')[0],
      createdAt: new Date().toISOString(),
    };
  }
  try {
    const existing = await getUserByIdentifier(db, identifier);
    if (existing) return existing;

    const user: User = {
      id: `usr-${Date.now()}`,
      identifier,
      name: name || identifier.split('@')[0],
      email: identifier.includes('@') ? identifier : '',
      phone: !identifier.includes('@') ? identifier : '',
      password: password || 'password123',
      createdAt: new Date().toISOString(),
    };

    await pool.query(
      `
      INSERT INTO public.users (id, identifier, name, email, phone, password, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (identifier) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password;
    `,
      [user.id, user.identifier, user.name, user.email, user.phone, user.password, user.createdAt]
    );

    return user;
  } catch (err: any) {
    console.warn('⚠️ PG findOrCreateUser error:', err.message);
    return {
      id: `usr-${Date.now()}`,
      identifier,
      name: name || identifier.split('@')[0],
      createdAt: new Date().toISOString(),
    };
  }
}

export async function updateUserProfile(db: Db, identifier: string, updates: Partial<User>): Promise<User | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const { name, email, phone, address, city, state, zipCode } = updates;
    await pool.query(
      `
      UPDATE public.users SET name = COALESCE($1, name), email = COALESCE($2, email),
      phone = COALESCE($3, phone), address = COALESCE($4, address), city = COALESCE($5, city),
      state = COALESCE($6, state), zip_code = COALESCE($7, zip_code)
      WHERE LOWER(identifier) = LOWER($8)
    `,
      [name, email, phone, address, city, state, zipCode, identifier]
    );
    return (await getUserByIdentifier(db, identifier)) || null;
  } catch (err: any) {
    console.warn('⚠️ PG updateUserProfile error:', err.message);
    return null;
  }
}

export async function getUserAddresses(db: Db, identifier: string): Promise<UserAddress[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(
      `SELECT * FROM public.user_addresses WHERE LOWER(user_identifier) = LOWER($1) ORDER BY created_at DESC`,
      [identifier]
    );
    return res.rows.map((r) => ({
      id: r.id,
      userIdentifier: r.user_identifier,
      label: r.label,
      fullName: r.full_name,
      phone: r.phone,
      addressLine: r.address_line,
      city: r.city,
      state: r.state,
      zipCode: r.zip_code,
      isDefault: r.is_default,
      createdAt: r.created_at,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getUserAddresses error:', err.message);
    return [];
  }
}

export async function addUserAddress(db: Db, 
  identifier: string,
  addressData: Omit<UserAddress, 'id' | 'userIdentifier' | 'createdAt'>
): Promise<UserAddress> {
  const newAddress: UserAddress = {
    ...addressData,
    id: `addr-${Date.now()}`,
    userIdentifier: identifier,
    isDefault: addressData.isDefault || false,
    createdAt: new Date().toISOString(),
  };

  const pool = db.pgPool;
  if (pool) {
    try {
      const existing = await getUserAddresses(db, identifier);
      if (existing.length === 0) newAddress.isDefault = true;

      if (newAddress.isDefault) {
        await pool.query(
          `UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1)`,
          [identifier]
        );
      }
      await pool.query(
        `
        INSERT INTO public.user_addresses (id, user_identifier, label, full_name, phone, address_line, city, state, zip_code, is_default, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING;
      `,
        [
          newAddress.id,
          newAddress.userIdentifier,
          newAddress.label,
          newAddress.fullName,
          newAddress.phone,
          newAddress.addressLine,
          newAddress.city,
          newAddress.state,
          newAddress.zipCode,
          newAddress.isDefault,
          newAddress.createdAt,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addUserAddress error:', err.message);
    }
  }
  return newAddress;
}

export async function setDefaultAddress(db: Db, identifier: string, addressId: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    await pool.query(
      `UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1)`,
      [identifier]
    );
    const res = await pool.query(
      `UPDATE public.user_addresses SET is_default = TRUE WHERE id = $1`,
      [addressId]
    );
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG setDefaultAddress error:', err.message);
    return false;
  }
}

export async function deleteUserAddress(db: Db, identifier: string, addressId: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(
      `DELETE FROM public.user_addresses WHERE id = $1 AND LOWER(user_identifier) = LOWER($2)`,
      [addressId, identifier]
    );
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteUserAddress error:', err.message);
    return false;
  }
}
