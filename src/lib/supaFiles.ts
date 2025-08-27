import { supabase } from './supabaseClient';

export type FileItem = {
  id: number;
  title: string | null;
  original_name: string;
  storage_path: string; // ex: journals/2025/08/uuid.pdf
  mimetype: string;
  size: number;
  uploaded_at: string;  // ISO
};

export async function listFiles(q?: string, type?: string): Promise<FileItem[]> {
  let query = supabase.from('files').select('*').order('uploaded_at', { ascending: false });

  if (q) query = query.or(`title.ilike.%${q}%,original_name.ilike.%${q}%`);

  if (type) {
    const map: Record<string,string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      sheet: 'spreadsheet',
      img: 'image/',
      zip: 'application/zip',
    };
    const f = map[type];
    if (f?.endsWith('/')) query = query.like('mimetype', `${f}%`);
    else if (f) query = query.like('mimetype', `%${f}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export function publicUrl(storage_path: string) {
  const [bucket, ...rest] = storage_path.split('/');
  return supabase.storage.from(bucket).getPublicUrl(rest.join('/')).data.publicUrl;
}

export async function signedUrl(storage_path: string, sec = 60) {
  const [bucket, ...rest] = storage_path.split('/');
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(rest.join('/'), sec);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeFile(item: FileItem) {
  const [bucket, ...rest] = item.storage_path.split('/');
  await supabase.storage.from(bucket).remove([rest.join('/')]);
  const { error } = await supabase.from('files').delete().eq('id', item.id);
  if (error) throw error;
}

export async function uploadFile(file: File, title?: string) {
    const bucket = 'journals'; // ganti jika nama bucket kamu beda
    const ext = file.name.split('.').pop() || 'bin';
    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const key = `${y}/${m}/${crypto.randomUUID()}.${ext}`;
  
    // 1) Upload ke Storage
    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(key, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
  
    if (uploadErr) {
      console.error('UPLOAD ERR:', uploadErr);
      throw uploadErr;
    }
  
    // 2) Insert metadata ke tabel
    const { error: insertErr } = await supabase.from('files').insert({
      title: title || null,
      original_name: file.name,
      storage_path: `${bucket}/${key}`,
      mimetype: file.type || 'application/octet-stream',
      size: file.size,
    });
  
    if (insertErr) {
      console.error('DB INSERT ERR:', insertErr);
      // rollback objek storage kalau insert DB gagal
      await supabase.storage.from(bucket).remove([key]).catch(() => {});
      throw insertErr;
    }
  }
  