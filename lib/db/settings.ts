import type { SiteSettings } from './types';
import type { Db } from './pool';
import { parseBoolean } from './rows';

export async function getSettings(db: Db): Promise<SiteSettings> {
  const pool = db.pgPool;
  if (pool) {
    try {
      const res = await pool.query(`SELECT * FROM public.site_settings LIMIT 1`);
      if (res && res.rows.length > 0) {
        const s = res.rows[0];
        return {
          isGlobalOrderingEnabled: parseBoolean(s.is_global_ordering_enabled, true),
          isWhatsappOrderingEnabled: parseBoolean(s.is_whatsapp_ordering_enabled, true),
          isWhatsappChatButtonEnabled: parseBoolean(s.is_whatsapp_chat_button_enabled, true),
          whatsappNumber: s.whatsapp_number || '',
          whatsappMessageTemplate: s.whatsapp_message_template || '',
          isWhatsappEnabled: parseBoolean(s.is_whatsapp_enabled, true),
          siteTitle: s.site_title || 'Kits and Craft',
          defaultMetaDescription: s.default_meta_description || '',
        };
      }
    } catch (err: any) {
      console.warn('⚠️ PG settings get notice:', err.message);
    }
  }
  return {
    isGlobalOrderingEnabled: true,
    isWhatsappOrderingEnabled: true,
    isWhatsappChatButtonEnabled: true,
    whatsappNumber: '',
    whatsappMessageTemplate:
      'Hi! I am interested in {productName} ({productUrl}). Can you help me with details?',
    isWhatsappEnabled: true,
    siteTitle: 'Kits and Craft',
    defaultMetaDescription:
      'Ready-to-paint craft figurines, scented aesthetic wax candles, and creative art kits.',
  };
}

export async function updateSettings(db: Db, updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings(db);
  const updated: SiteSettings = {
    ...current,
    ...updates,
    isGlobalOrderingEnabled: parseBoolean(
      updates.isGlobalOrderingEnabled,
      current.isGlobalOrderingEnabled
    ),
    isWhatsappOrderingEnabled: parseBoolean(
      updates.isWhatsappOrderingEnabled,
      current.isWhatsappOrderingEnabled
    ),
    isWhatsappChatButtonEnabled: parseBoolean(
      updates.isWhatsappChatButtonEnabled,
      current.isWhatsappChatButtonEnabled
    ),
  };

  const pool = db.pgPool;
  if (!pool) {
    throw new Error('Database is not configured');
  }

  const checkRes = await pool.query(`SELECT id FROM public.site_settings LIMIT 1`);
  if (checkRes && checkRes.rows.length > 0) {
    const rowId = checkRes.rows[0].id;
    await pool.query(
      `
      UPDATE public.site_settings SET
        is_global_ordering_enabled = $1,
        is_whatsapp_ordering_enabled = $2,
        is_whatsapp_chat_button_enabled = $3,
        whatsapp_number = $4,
        whatsapp_message_template = $5,
        is_whatsapp_enabled = $6,
        site_title = $7,
        default_meta_description = $8
      WHERE id = $9;
    `,
      [
        updated.isGlobalOrderingEnabled,
        updated.isWhatsappOrderingEnabled,
        updated.isWhatsappChatButtonEnabled,
        updated.whatsappNumber || '',
        updated.whatsappMessageTemplate || '',
        updated.isWhatsappOrderingEnabled || updated.isWhatsappChatButtonEnabled,
        updated.siteTitle || 'Kits and Craft',
        updated.defaultMetaDescription || '',
        rowId,
      ]
    );
  } else {
    await pool.query(
      `
      INSERT INTO public.site_settings (id, is_global_ordering_enabled, is_whatsapp_ordering_enabled, is_whatsapp_chat_button_enabled, whatsapp_number, whatsapp_message_template, is_whatsapp_enabled, site_title, default_meta_description)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8);
    `,
      [
        updated.isGlobalOrderingEnabled,
        updated.isWhatsappOrderingEnabled,
        updated.isWhatsappChatButtonEnabled,
        updated.whatsappNumber || '',
        updated.whatsappMessageTemplate || '',
        updated.isWhatsappOrderingEnabled || updated.isWhatsappChatButtonEnabled,
        updated.siteTitle || 'Kits and Craft',
        updated.defaultMetaDescription || '',
      ]
    );
  }

  const saved = await getSettings(db);
  if (saved.isWhatsappChatButtonEnabled !== updated.isWhatsappChatButtonEnabled) {
    throw new Error('WhatsApp chat button setting did not save');
  }
  return saved;
}
