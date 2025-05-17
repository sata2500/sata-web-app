// tailwind.config.js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  // Tailwind hangi dosyalarda sınıf adlarını arayacağını belirler
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  // Karanlık mod sınıf tabanlı olarak çalışacak
  darkMode: "class",
  
  theme: {
    extend: {
      // Özel renk paletimiz
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)"
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          light: "var(--color-secondary-light)",
          dark: "var(--color-secondary-dark)"
        },
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)"
        },
        border: "var(--color-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)"
      },
      
      // Font aileleri tanımları
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"]
      },
      
      // Köşe yuvarlama değerleri
      borderRadius: {
        DEFAULT: "var(--border-radius)",
        sm: "calc(var(--border-radius) / 2)",
        lg: "calc(var(--border-radius) * 1.5)",
        xl: "calc(var(--border-radius) * 2)"
      },
      
      // Container ayarları
      container: {
        center: true,
        padding: {
          DEFAULT: "var(--spacing-md)",
          sm: "var(--spacing-md)",
          md: "var(--spacing-lg)",
          lg: "var(--spacing-lg)",
          xl: "var(--spacing-xl)"
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px"
        }
      },
      
      // Eğer gerekirse özel ekran boyutları
      screens: {
        xs: "480px"
      },
      
      // Özel boşluk değerleri
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)"
      },
      
      // Font boyutları
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)"
      },
      
      // Gölge efektleri
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      },
      
      // Özel animasyon süreleri
      transitionDuration: {
        DEFAULT: "150ms",
        fast: "100ms",
        slow: "300ms"
      },
      
      // Özel animasyon türleri
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      
      // Typography eklentisi için özelleştirmeler
      typography: () => ({
        DEFAULT: {
          css: {
            color: 'var(--color-foreground)',
            a: {
              color: 'var(--color-primary)',
              '&:hover': {
                color: 'var(--color-primary-dark)',
              },
            },
            h1: {
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-heading)',
            },
            h2: {
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-heading)',
            },
            h3: {
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-heading)',
            },
            h4: {
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-heading)',
            },
            blockquote: {
              color: 'var(--color-foreground)',
              borderLeftColor: 'var(--color-primary)',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            code: {
              color: 'var(--color-foreground)',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            pre: {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              color: 'var(--color-foreground)',
            },
          },
        },
        dark: {
          css: {
            color: 'var(--color-foreground)',
            a: {
              color: 'var(--color-primary)',
              '&:hover': {
                color: 'var(--color-primary-light)',
              },
            },
            blockquote: {
              color: 'var(--color-foreground)',
              borderLeftColor: 'var(--color-primary)',
            },
            code: {
              color: 'var(--color-foreground)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            pre: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--color-foreground)',
            },
          },
        },
      }),
    }
  },
  
  // Ek plugin'ler
  plugins: [typography],
};

export default tailwindConfig;