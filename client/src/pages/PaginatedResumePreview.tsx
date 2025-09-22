import React, { useRef, useEffect, useState } from 'react';
import { Resume } from '@/types/resume';
import { ResumePreview } from './editor';

const A4_HEIGHT_PX = 1056;
const PAGE_PADDING_TOP = 80;
const PAGE_PADDING_BOTTOM = 80;

const PaginatedResumePreview = ({ data, sectionVisibility, fontSettings, fieldFormats, getFieldFormatting, onFieldClick, isLoading }) => {
  const [pages, setPages] = useState([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading || !data) {
      return;
    }

    const paginate = () => {
      console.log("Paginating...");
      if (!contentRef.current) {
        console.log("Content ref is not set.");
        return;
      }

      const newPages = [];
      let currentPage = [];
      let currentPageHeight = 0;

      const elements = Array.from(contentRef.current.children);
      console.log("Elements to paginate:", elements);
      console.log("Content ref innerHTML:", contentRef.current.innerHTML);


      elements.forEach(el => {
        const elementHeight = el.offsetHeight;

        if (currentPageHeight + elementHeight > A4_HEIGHT_PX - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM) {
          newPages.push(currentPage);
          currentPage = [el.cloneNode(true)];
          currentPageHeight = elementHeight;
        } else {
          currentPage.push(el.cloneNode(true));
          currentPageHeight += elementHeight;
        }
      });

      newPages.push(currentPage);
      console.log("New pages:", newPages);
      setPages(newPages);
    };

    const resizeObserver = new ResizeObserver(() => {
      paginate();
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, sectionVisibility, fontSettings, fieldFormats, isLoading]);

  return (
    <div className="paginated-resume-preview">
      {pages.map((page, index) => (
        <div key={index} className="a4-page" style={{ paddingTop: `${PAGE_PADDING_TOP}px`, paddingBottom: `${PAGE_PADDING_BOTTOM}px` }}>
          {page.map((el, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: el.outerHTML }} />
          ))}
        </div>
      ))}
      <div ref={contentRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ResumePreview
          data={data}
          sectionVisibility={sectionVisibility}
          fontSettings={fontSettings}
          fieldFormats={fieldFormats}
          getFieldFormatting={getFieldFormatting}
          onFieldClick={onFieldClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default PaginatedResumePreview;
