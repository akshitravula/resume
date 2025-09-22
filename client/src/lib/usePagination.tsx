import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const A4_HEIGHT_PX = (297 * 3.7795275591) - 151.18; // Standard conversion ratio for A4 height in pixels (assuming 96 DPI)

export const usePagination = (sectionsToPaginate: React.ReactNode[]) => {
  const [pages, setPages] = useState<React.ReactNode[][]>([[]]);

  useEffect(() => {
    const newPages: React.ReactNode[][] = [[]];
    let currentPage = 0;
    let currentPageHeight = 0;

    const tempContainer = document.createElement('div');
    tempContainer.style.width = `210mm`; // A4 width
    tempContainer.style.padding = '20mm'; // This should match the padding of ResumePage
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.visibility = 'hidden'; // Hide it completely
    document.body.appendChild(tempContainer);

    // Clear previous content in tempContainer to ensure accurate measurement
    tempContainer.innerHTML = '';

    sectionsToPaginate.forEach((section) => {
      const sectionContainer = document.createElement('div');
      // Render each section into a temporary container to measure its height
      // Wrap in a fragment to ensure ReactDOM.render has a single root element
      ReactDOM.render(<>{section}</>, sectionContainer);
      tempContainer.appendChild(sectionContainer);

      const sectionHeight = sectionContainer.offsetHeight;

      // Check if adding this section exceeds the current page height
      if (currentPageHeight + sectionHeight > A4_HEIGHT_PX) {
        currentPage++;
        newPages[currentPage] = [];
        currentPageHeight = 0; // Reset height for new page
      }

      newPages[currentPage].push(section);
      currentPageHeight += sectionHeight;

      // Remove the section from the tempContainer after measuring
      // This is important to prevent cumulative height issues if not cleared
      tempContainer.removeChild(sectionContainer);
    });

    document.body.removeChild(tempContainer);
    setPages(newPages);
  }, [sectionsToPaginate]); // Dependency array now depends on the sections to paginate

  return pages;
};