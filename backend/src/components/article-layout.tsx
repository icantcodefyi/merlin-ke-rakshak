import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pencil, Check } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

interface EditableTitleProps {
  title: string
  onSave: (newTitle: string) => void
  isGenerating: boolean
}

const EditableTitle = ({ title, onSave, isGenerating }: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleSave = () => {
    onSave(editedTitle);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center max-w-4xl mx-auto">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="text-4xl md:text-5xl font-bold bg-transparent border-b border-primary w-full mr-2 focus:outline-none text-center"
          autoFocus
        />
        <Button onClick={handleSave} size="sm" className="h-8 w-8 p-0">
          <Check className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative inline-block max-w-4xl mx-auto text-center"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-center">{title}</h1>
      {!isGenerating && (
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          variant="ghost"
          className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
};

interface TableOfContentsProps {
  titles: Array<{
    id: number;
    text: string;
    outline: string;
  }>;
  sections: Array<{
    content: string;
  }>;
}

const TableOfContents = ({ titles, sections }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('');
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);

  useEffect(() => {
    // Extract headings from sections content
    const extractedHeadings = sections.flatMap((section, sectionIndex) => {
      const headings: Array<{ id: string; text: string; level: number }> = [];
      const lines = section.content.split('\n');
      
      lines.forEach(line => {
        const h2Match = line.match(/^## (.+)/);
        const h3Match = line.match(/^### (.+)/);
        
        if (h2Match) {
          const text = h2Match[1].trim();
          headings.push({
            id: `section-${sectionIndex}-${text.toLowerCase().replace(/\s+/g, '-')}`,
            text,
            level: 2
          });
        } else if (h3Match) {
          const text = h3Match[1].trim();
          headings.push({
            id: `section-${sectionIndex}-${text.toLowerCase().replace(/\s+/g, '-')}`,
            text,
            level: 3
          });
        }
      });
      
      return headings;
    });

    setHeadings(extractedHeadings);
  }, [sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -35% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  return (
    <nav className="space-y-2">
      <h3 className="font-semibold mb-4 text-lg">Table of contents</h3>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={`${level === 3 ? 'ml-4' : ''}`}>
            <a
              href={`#${id}`}
              className={`block text-sm hover:text-primary transition-colors ${
                activeId === id ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

interface ArticleLayoutProps {
  article: {
    mainTitle: string;
    topic: string;
    titles: Array<{
      id: number;
      text: string;
      outline: string;
    }>;
    sections: Array<{
      content: string;
      mediaTag: string;
      mediaContent: string | null;
      mediaCaption: string | null;
    }>;
  };
  isGenerating: boolean;
  onTitleEdit: (newTitle: string) => void;
}

export function ArticleLayout({ article, isGenerating, onTitleEdit }: ArticleLayoutProps) {
  // Find the first web-image URL from the sections
  const heroImage = article.sections.reduce<string | null>((acc, section) => {
    if (acc) return acc;
    const match = section.content.match(/<web-image>(.*?)<\/web-image>/);
    return match ? match[1] : acc;
  }, null);

  return (
    <Card className="relative">
      <div className="relative">
        {heroImage && (
          <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
            <Image
              src={heroImage}
              alt="Article hero"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
          </div>
        )}
        <div className="relative px-6 py-12 md:py-16">
          <div className="max-w-[800px] mx-auto text-center space-y-4">
            <EditableTitle
              title={article.mainTitle}
              onSave={onTitleEdit}
              isGenerating={isGenerating}
            />
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              {article.topic}
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 relative">
          <div className="flex-1 prose max-w-none">
            {article.titles.map((title, index) => (
              <div key={title.id} className="mb-12">
                <h2 
                  id={`section-${index}-${title.text.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-2xl font-bold mb-4"
                >
                  {title.text}
                </h2>
                {article.sections[index] && (
                  <div className="prose max-w-none">
                    {processContent(
                      article.sections[index].content,
                      article.sections[index].mediaContent,
                      article.sections[index].mediaCaption,
                      index
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="lg:w-64 shrink-0">
            <div className="sticky top-4">
              <TableOfContents 
                titles={article.titles}
                sections={article.sections}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function processContent(
  content: string,
  mediaContent: string | null,
  mediaCaption: string | null,
  sectionIndex: number
) {
  const parts = content.split(/(<gen-image>.*?<\/gen-image>|<web-image>.*?<\/web-image>|<graph>.*?<\/graph>|<table>.*?<\/table>)/s);
  
  let isFirstH3Removed = false;

  return parts.map((part, index) => {
    // Skip the first web-image as it's used in the hero
    if (sectionIndex === 0 && index === 0 && part.startsWith('<web-image>')) {
      return null;
    }

    // Process other content normally
    if (part.startsWith('<gen-image>') && mediaContent) {
      return (
        <div key={index} className="my-4">
          <Image
            src={`data:image/png;base64,${mediaContent}`}
            alt="Generated image"
            width={512}
            height={512}
            className="rounded-lg w-full h-auto"
          />
          {mediaCaption && <p className="text-sm text-muted-foreground italic mt-2">{mediaCaption}</p>}
        </div>
      );
    } else if (part.startsWith('<web-image>')) {
      const imageUrl = part.match(/<web-image>(.*?)<\/web-image>/)?.[1];
      if (imageUrl) {
        return (
          <div key={index} className="my-4">
            <Image
              src={imageUrl}
              alt="Web image"
              width={512}
              height={512}
              className="rounded-lg w-full h-auto"
            />
            {mediaCaption && <p className="text-sm text-muted-foreground italic mt-2">{mediaCaption}</p>}
          </div>
        );
      }
    } else {
      // Process markdown content
      const lines = part.split('\n');
      const processedLines = lines.map(line => {
        if (line.startsWith('### ') && !isFirstH3Removed) {
          isFirstH3Removed = true;
          return ''; // Remove the first h3
        }
        return line;
      }).filter(Boolean); // Remove empty lines
      
      // Add IDs to headings for navigation
      const contentWithIds = processedLines.map(line => {
        const h3Match = line.match(/^### (.+)/);
        if (h3Match) {
          const text = h3Match[1].trim();
          const id = `section-${sectionIndex}-${text.toLowerCase().replace(/\s+/g, '-')}`;
          return `### ${text} {#${id}}`;
        }
        return line;
      }).join('\n');
      
      return <ReactMarkdown key={index}>{contentWithIds}</ReactMarkdown>;
    }
  });
}

