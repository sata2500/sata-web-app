// src/components/admin/blog-editor.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import NextImage from 'next/image'; // Next.js Image bileşenini farklı bir isimle import edin
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPost } from '@/types/blog';
import { createBlogPost, updateBlogPost, uploadBlogCoverImage } from '@/lib/blog-service';
import { generateSlug } from '@/lib/blog-service';

interface BlogEditorProps {
  post?: BlogPost;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ post }) => {
  const router = useRouter();
  const { user } = useAuth(); // userProfile değişkenini kaldırdık
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  //const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');
  const [featured, setFeatured] = useState(post?.featured || false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImage || '');
  
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gelişmiş Tiptap editör
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto',
        },
      }),
      Table.configure({
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Typography,
      Underline,
    ],
    content: post?.content || '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert focus:outline-none',
        spellcheck: 'false',
      },
    },
  });
  // Başlık değiştiğinde slug otomatik oluşturma
  useEffect(() => {
    if (!post && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, post, slug]);

  const handleSave = async (saveAsDraft = false) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!title) {
        setError('Başlık gereklidir.');
        return;
      }

      if (!content) {
        setError('İçerik gereklidir.');
        return;
      }

      if (!user) {
        setError('Oturum açmanız gerekiyor.');
        return;
      }

      // Özetin ilk 160 karakteri otomatik olarak ayarla (eğer kullanıcı girmezse)
      const finalExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160);

      const blogData: Partial<BlogPost> = {
        title,
        slug: slug || generateSlug(title),
        content,
        excerpt: finalExcerpt,
        tags,
        status: saveAsDraft ? 'draft' : 'published',
        featured
      };

      if (!post) {
        // Yeni blog yazısı oluşturma
        blogData.author = {
          id: user.id,
          name: user.displayName || user.email.split('@')[0],
          avatar: user.photoURL || null
        };

        const newPostId = await createBlogPost(blogData as Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt' | 'viewCount'>);

        // Kapak resmi yükleme (varsa)
        if (coverImage) {
          const coverImageUrl = await uploadBlogCoverImage(coverImage, newPostId);
          await updateBlogPost(newPostId, { coverImage: coverImageUrl });
        }

        setSuccess('Blog yazısı başarıyla oluşturuldu.');
        
        // Yeni yazı için düzenleme sayfasına yönlendir
        router.push(`/admin/blog/${newPostId}/edit`);
      } else {
        // Mevcut blog yazısını güncelleme
        await updateBlogPost(post.id as string, blogData);

        // Kapak resmi yükleme (varsa)
        if (coverImage) {
          const coverImageUrl = await uploadBlogCoverImage(coverImage, post.id as string);
          await updateBlogPost(post.id as string, { coverImage: coverImageUrl });
        }

        setSuccess('Blog yazısı başarıyla güncellendi.');
      }
    } catch (err) {
      console.error('Blog yazısı kaydedilirken hata oluştu:', err);
      setError('Blog yazısı kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      
      // Zaten var olan etiket mi kontrol et
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
      setCoverImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 text-success p-4 rounded-md">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Başlık
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog yazınızın başlığı"
              className="text-lg"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1">
              Slug (URL)
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ornek-blog-yazisiniz-basligi"
              className="text-sm font-mono"
            />
            <p className="text-xs text-foreground/60 mt-1">
              URL: https://sata.com/blog/{slug}
            </p>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              İçerik
            </label>
            <div className="min-h-[400px] border border-border rounded-md overflow-hidden">
              {/* Editör Toolbar */}
              <div className="border-b border-border p-2 flex flex-wrap gap-1">
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Kalın"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="İtalik"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="4" x2="10" y2="4"></line>
                    <line x1="14" y1="20" x2="5" y2="20"></line>
                    <line x1="15" y1="4" x2="9" y2="20"></line>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`p-1 rounded ${editor?.isActive('underline') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Altı Çizili"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                    <line x1="4" y1="21" x2="20" y2="21"></line>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={`p-1 rounded ${editor?.isActive('strike') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Üstü Çizili"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <path d="M16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6"></path>
                    <path d="M8 18C8 20.2091 9.79086 22 12 22C14.2091 22 16 20.2091 16 18"></path>
                  </svg>
                </button>
                
                <span className="mx-1 h-6 border-r border-border"></span>
                
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`p-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="H1 Başlık"
                  type="button"
                >
                  <span className="font-bold">H1</span>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="H2 Başlık"
                  type="button"
                >
                  <span className="font-bold">H2</span>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`p-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="H3 Başlık"
                  type="button"
                >
                  <span className="font-bold">H3</span>
                </button>
                
                <span className="mx-1 h-6 border-r border-border"></span>
                
                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Madde İşaretli Liste"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`p-1 rounded ${editor?.isActive('orderedList') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Numaralı Liste"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="10" y1="6" x2="21" y2="6"></line>
                    <line x1="10" y1="12" x2="21" y2="12"></line>
                    <line x1="10" y1="18" x2="21" y2="18"></line>
                    <path d="M4 6h1v4"></path>
                    <path d="M4 10h2"></path>
                    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  className={`p-1 rounded ${editor?.isActive('blockquote') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Alıntı"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l4.18 0c.76 0 1.14 0 1.45.15c.28.13.5.35.63.63c.15.3.15.69.15 1.45v2.55c0 .76 0 1.14-.15 1.45c-.13.28-.35.5-.63.63c-.3.15-.69.15-1.45.15h-2.55c-.76 0-1.14 0-1.45-.15c-.28-.13-.5-.35-.63-.63c-.15-.3-.15-.69-.15-1.45v-4.18c0-.76 0-1.14.15-1.45c.13-.28.35-.5.63-.63c.3-.15.69-.15 1.45-.15Z"></path>
                    <path d="M13 8l4.18 0c.76 0 1.14 0 1.45.15c.28.13.5.35.63.63c.15.3.15.69.15 1.45v2.55c0 .76 0 1.14-.15 1.45c-.13.28-.35.5-.63.63c-.3.15-.69.15-1.45.15h-2.55c-.76 0-1.14 0-1.45-.15c-.28-.13-.5-.35-.63-.63c-.15-.3-.15-.69-.15-1.45v-4.18c0-.76 0-1.14.15-1.45c.13-.28.35-.5.63-.63c.3-.15.69-.15 1.45-.15Z"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  className={`p-1 rounded ${editor?.isActive('codeBlock') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Kod Bloğu"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </button>
                
                <span className="mx-1 h-6 border-r border-border"></span>
                
                <button
                  onClick={() => {
                    const url = window.prompt('Link URL:');
                    if (url) {
                      editor?.chain().focus().setLink({ href: url }).run();
                    } else if (editor?.isActive('link')) {
                      editor?.chain().focus().unsetLink().run();
                    }
                  }}
                  className={`p-1 rounded ${editor?.isActive('link') ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                  title="Link Ekle"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => {
                    const url = window.prompt('Resim URL:');
                    if (url) {
                      editor?.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  className="p-1 rounded hover:bg-primary/5"
                  title="Resim Ekle"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo()}
                  className="p-1 rounded hover:bg-primary/5 ml-auto"
                  title="Geri Al"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                  className="p-1 rounded hover:bg-primary/5"
                  title="İleri Al"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 7v6h-6"></path>
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                  </svg>
                </button>
              </div>
              
              {/* Editor Content */}
              <EditorContent editor={editor} className="p-4 min-h-[350px]" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={loading}
                >
                  Taslak Olarak Kaydet
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                >
                  {post?.status === 'published' ? 'Güncelle' : 'Yayınla'}
                </Button>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Öne Çıkan
                  </label>
                </div>
                <p className="text-xs text-foreground/60">
                  Bu yazı ana sayfada öne çıkanlar bölümünde gösterilecek.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
                  Özet
                </label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Blog yazınızın kısa özeti (160 karakter)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-foreground/60 mt-1">
                  {excerpt.length}/160 karakter
                </p>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1">
                  Etiketler
                </label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  placeholder="Etiket eklemek için yazıp Enter'a basın"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="text-xs opacity-70 hover:opacity-100"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium mb-1">
                  Kapak Resmi
                </label>
                <input
                  type="file"
                  id="coverImage"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
                
                {coverImageUrl ? (
                  <div className="relative mt-2">
                    <NextImage
                      src={coverImageUrl}
                      alt="Kapak resmi önizleme"
                      width={500}
                      height={160}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <button
                      onClick={() => {
                        setCoverImage(null);
                        setCoverImageUrl('');
                      }}
                      className="absolute top-2 right-2 bg-background text-foreground p-1 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 flex flex-col items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Kapak Resmi Ekle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}