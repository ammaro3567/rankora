import jsPDF from 'jspdf';

interface AnalysisResult {
  readability: number;
  factuality: number;
  structure: number;
  qa_format: number;
  structured_data: number;
  authority: number;
  suggestions: string[];
}

export const exportAnalysisReport = async (result: AnalysisResult, url: string) => {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * fontSize * 0.35); // Return new Y position
    };

    // Helper function to get score color
    const getScoreColor = (score: number): [number, number, number] => {
      if (score >= 80) return [139, 92, 246]; // Purple (success)
      if (score >= 60) return [249, 115, 22]; // Orange (warning)
      return [239, 68, 68]; // Red (error)
    };

    // Header
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Content Analysis Report', margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI Overviews Optimization Analysis', margin, 35);

    yPosition = 55;

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // URL Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analyzed URL:', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(url, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 10;

    // Analysis Date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Analysis Date: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin, yPosition);
    yPosition += 15;

    // Scores Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analysis Scores', margin, yPosition);
    yPosition += 10;

    // Draw a line under the heading
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Score metrics
    const metrics = [
      { name: 'Readability', score: result.readability, description: 'Sentence structure, vocabulary complexity, and reading ease' },
      { name: 'Factuality', score: result.factuality, description: 'Claims verification, citations, and factual accuracy' },
      { name: 'Structure', score: result.structure, description: 'Content organization, headings, and formatting' },
      { name: 'Q&A Format', score: result.qa_format, description: 'Question-answer structure optimization' },
      { name: 'Structured Data', score: result.structured_data, description: 'Schema markup and rich snippets implementation' },
      { name: 'Authority & Trust', score: result.authority, description: 'Source credibility and trustworthiness indicators' }
    ];

    metrics.forEach((metric) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      // Score box
      const boxHeight = 25;
      const scoreColor = getScoreColor(metric.score);
      
      // Background box
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, boxHeight, 'F');
      
      // Score circle
      pdf.setFillColor(...scoreColor);
      pdf.circle(margin + 15, yPosition + 7, 8, 'F');
      
      // Score text in circle
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.score.toString(), margin + (metric.score >= 100 ? 9 : 11), yPosition + 10);
      
      // Metric name
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.name, margin + 35, yPosition + 5);
      
      // Description
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      yPosition = addWrappedText(metric.description, margin + 35, yPosition + 12, pageWidth - margin - 70, 9);
      
      yPosition += 15;
    });

    // Overall Score
    const overallScore = Math.round((result.readability + result.factuality + result.structure + result.qa_format + result.structured_data + result.authority_trust) / 6);
    
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    // Overall score section
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Score', margin + 10, yPosition + 10);
    
    pdf.setFontSize(24);
    pdf.text(`${overallScore}/100`, pageWidth - margin - 40, yPosition + 15);
    
    yPosition += 40;

    // Suggestions Section
    if (result.suggestions && result.suggestions.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Improvement Suggestions', margin, yPosition);
      yPosition += 10;

      // Draw a line under the heading
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      result.suggestions.forEach((suggestion) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Bullet point
        pdf.setFillColor(59, 130, 246);
        pdf.circle(margin + 5, yPosition + 2, 2, 'F');
        
        // Suggestion text
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(suggestion, margin + 15, yPosition, pageWidth - margin - 25);
        yPosition += 8;
      });
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      pdf.text('Generated by AI Content Scorer', margin, pageHeight - 10);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const domain = new URL(url).hostname;
    const filename = `content-analysis-${domain}-${timestamp}.pdf`;

    // Save the PDF
    pdf.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};