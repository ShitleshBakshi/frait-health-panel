// Utility function to print both FRAT and FRAI reports together
export function printCombinedReports(familyId: string, assessmentId: string) {
  // Create a new window that will show both reports
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  
  if (!printWindow) {
    alert('Please allow pop-ups for this site to enable printing');
    return;
  }

  // Get the current base URL
  const baseUrl = window.location.origin;
  
  // HTML template for the combined print view
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Combined FRAT & FRAI Report</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        
        .report-container {
          width: 100%;
          height: 50vh;
          border: none;
        }
        
        .frai-container {
          margin-top: 20px;
        }
        
        @media print {
          .frai-container {
            page-break-before: always;
          }
          
          .report-container {
            height: auto;
            min-height: 100vh;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          /* Hide any buttons or navigation elements */
          button, .no-print {
            display: none !important;
          }
        }
        
        .loading {
          text-align: center;
          padding: 20px;
          font-size: 18px;
        }
        
        .print-button {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: #1e56b0;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .print-button:hover {
          background: #144a94;
        }
        
        @media print {
          .print-button {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">Print Both Reports</button>
      
      <div class="loading" id="loading">Loading reports...</div>
      
      <!-- FRAT Report -->
      <div id="frat-container">
        <iframe 
          id="frat-frame"
          class="report-container" 
          src="${baseUrl}/families/${familyId}/assessment/${assessmentId}/frat"
          onload="checkLoaded()"
        ></iframe>
      </div>
      
      <!-- FRAI Report -->
      <div class="frai-container">
        <iframe 
          id="frai-frame"
          class="report-container" 
          src="${baseUrl}/families/${familyId}/assessment/${assessmentId}/frai"
          onload="checkLoaded()"
        ></iframe>
      </div>
      
      <script>
        let loadedCount = 0;
        
        function checkLoaded() {
          loadedCount++;
          if (loadedCount >= 2) {
            document.getElementById('loading').style.display = 'none';
            
            // Apply print styles to both iframes
            const fratFrame = document.getElementById('frat-frame');
            const fraiFrame = document.getElementById('frai-frame');
            
            try {
              // Add print-specific styles to both frames
              if (fratFrame.contentDocument) {
                const fratStyle = fratFrame.contentDocument.createElement('style');
                fratStyle.innerHTML = \`
                  @media print {
                    header, nav, button, .no-print {
                      display: none !important;
                    }
                    aside, .sidebar, [data-sidebar="sidebar"] {
                      display: none !important;
                    }
                    body, main {
                      background: white !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    .flex-1, .max-w-4xl, .mx-auto {
                      width: 100% !important;
                      max-width: 100% !important;
                    }
                  }
                \`;
                fratFrame.contentDocument.head.appendChild(fratStyle);
              }
              
              if (fraiFrame.contentDocument) {
                const fraiStyle = fraiFrame.contentDocument.createElement('style');
                fraiStyle.innerHTML = \`
                  @media print {
                    header, nav, button, .no-print {
                      display: none !important;
                    }
                    aside, .sidebar, [data-sidebar="sidebar"] {
                      display: none !important;
                    }
                    body {
                      background: white !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    .max-w-7xl, .mx-auto {
                      width: 100% !important;
                      max-width: 100% !important;
                    }
                  }
                \`;
                fraiFrame.contentDocument.head.appendChild(fraiStyle);
              }
            } catch (e) {
              console.log('Could not modify iframe styles due to CORS policy');
            }
          }
        }
        
        // Override window.print to print both iframes
        window.originalPrint = window.print;
        window.print = function() {
          try {
            // Try to print the entire window including both iframes
            window.originalPrint();
          } catch (e) {
            console.error('Print failed:', e);
            alert('Printing failed. Please use your browser\\'s print function (Ctrl+P or Cmd+P)');
          }
        };
        
        // Auto-focus for better UX
        window.focus();
      </script>
    </body>
    </html>
  `;

  // Write the content and close the document
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}