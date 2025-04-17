'use client';

import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyEditor({ value, onChange, height = 500 }) {
  const editorRef = useRef(null);
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'f9vyr6bvjrdk58pm79uhtqx1lv47v10wdlzsrypaok84krev';

  return (
    <Editor
      apiKey={apiKey}
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        branding: false,
        promotion: false,
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        // Simple image upload handler
        images_upload_handler: async function (blobInfo, progress) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
              const img = new Image();
              img.src = reader.result;
              resolve(reader.result);
            };
            reader.onerror = function () {
              reject("error while uploading")
            };
            reader.readAsDataURL(blobInfo.blob());
          });
        }
      }}
    />
  );
}