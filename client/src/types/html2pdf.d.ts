declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number] | [number, number, number, number];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { scale: number; [key: string]: any };
    jsPDF?: { unit: string; format: string; orientation: string; [key: string]: any };
    pagebreak?: { mode: string | string[]; before?: string; after?: string; avoid?: string };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    save(): Promise<void>;
    output(type: string): Promise<any>;
    outputPdf(type?: string): Promise<any>;
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any): Promise<any>;
  }

  function html2pdf(): Html2Pdf;
  export = html2pdf;
}