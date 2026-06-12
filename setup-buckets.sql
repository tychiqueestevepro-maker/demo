-- Create the "documents" bucket for campaign and user files
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;


-- Policy: Users can upload their own documents
-- We will store documents under a folder named after their auth.uid()
create policy "Users can upload their own documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own documents
create policy "Users can read their own documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own documents
create policy "Users can delete their own documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own documents
create policy "Users can update their own documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);
