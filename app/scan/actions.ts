'use server';
import { performScan } from '../../lib/scan';
import { supabase } from '../../lib/db/client';

export async function uploadAndScan(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  // 1. Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be signed in to upload files');
  }

  // 2. Read file content as text (UTF-8)
  const content = await file.text();

  try {
    // 3. Execute the Scan Orchestrator
    const result = await performScan(user.id, file.name, content);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
