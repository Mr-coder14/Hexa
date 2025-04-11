import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { useNavigate } from "react-router-dom";
import "../css/Xerox.css";

function Xerox() {
  const [files, setFiles] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    // Log the files being uploaded for debugging
    console.log("Files being uploaded:", uploadedFiles);
    
    const newFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        let totalPages = 1;

        if (file.type === "application/pdf") {
          try {
            const reader = new FileReader();
            const pdfBytes = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result);
              reader.onerror = (error) => reject(error);
              reader.readAsArrayBuffer(file);
            });
            
            const pdfDoc = await PDFDocument.load(pdfBytes);
            totalPages = pdfDoc.getPageCount();
            console.log(`PDF ${file.name} has ${totalPages} pages`);
          } catch (error) {
            console.error(`Error reading PDF ${file.name}:`, error);
            totalPages = 1; // Default to 1 if we can't read the PDF
          }
        }

        // Calculate initial pricing when adding files
        const perPagePrice = 1.30;
        const amountPerQuantity = perPagePrice * totalPages;
        
        // Create a new file data object with all necessary fields
        return {
          file: file, // Store the actual File object
          fileName: file.name, // Also store name separately in case File object gets lost
          fileType: file.type, 
          fileSize: file.size,
          paperType: "A4",
          printType: "black-white",
          ratio: "1:1",
          format: "Front Only",
          quantity: 1,
          spiralBinding: false,
          totalPages,
          perPagePrice,
          amountPerQuantity,
          finalAmount: amountPerQuantity
        };
      })
    );
    
    // Add new files to state
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    // Reset the file input value so the same file can be added again if needed
    event.target.value = "";
  };

  // Calculate prices without modifying state
  useEffect(() => {
    if (files.length === 0) return;
    
    let totalAmount = 0;
    
    files.forEach(fileData => {
      // Calculate per page price
      let perpage = 0;
      
      if (fileData.paperType === "A4") {
        if (fileData.printType === "color") {
          perpage = 10.0;
        } else {
          if (fileData.format === "Front Only" && fileData.ratio === "1:1") {
            perpage = 1.30;
          }
          if (fileData.format === "Front & Back" && fileData.ratio === "1:2") {
            perpage = 0.75;
          }
          if (fileData.format === "Front & Back" && fileData.ratio === "1:1") {
            perpage = 0.75;
          }
          if (fileData.format === "Front Only" && fileData.ratio === "1:2") {
            perpage = 1.30;
          }
        }
      } else {
        // For Bonafide/OHP paper
        perpage = 15.0;
      }
      
      // Calculate amount per quantity
      let amtperqty = perpage * fileData.totalPages;
      
      // Apply 1:2 ratio discount if applicable
      if (fileData.ratio === "1:2") {
        amtperqty = amtperqty / 2;
      }
      
      // Calculate final amount
      let finalamount = amtperqty * fileData.quantity;
      
      // Add spiral binding cost if selected
      if (fileData.spiralBinding) {
        finalamount += 20.0 * fileData.quantity;
      }
      
      totalAmount += finalamount;
    });
    
    // Only update the total cost, not the files
    setTotalCost(totalAmount);
  }, [files]); // Keep files as dependency

  // Create a separate function to recalculate a file when its properties change
  const handleChange = (index, field, value) => {
    const updatedFiles = [...files];
    updatedFiles[index][field] = value;
    
    // Recalculate this specific file's pricing
    const file = updatedFiles[index];
    
    // Calculate per page price
    let perpage = 0;
    
    if (file.paperType === "A4") {
      if (file.printType === "color") {
        perpage = 10.0;
      } else {
        if (file.format === "Front Only" && file.ratio === "1:1") {
          perpage = 1.30;
        }
        if (file.format === "Front & Back" && file.ratio === "1:2") {
          perpage = 0.75;
        }
        if (file.format === "Front & Back" && file.ratio === "1:1") {
          perpage = 0.75;
        }
        if (file.format === "Front Only" && file.ratio === "1:2") {
          perpage = 1.30;
        }
      }
    } else {
      // For Bonafide/OHP paper
      perpage = 15.0;
    }
    
    file.perPagePrice = perpage;
    
    // Calculate amount per quantity
    let amtperqty = perpage * file.totalPages;
    
    // Apply 1:2 ratio discount if applicable
    if (file.ratio === "1:2") {
      amtperqty = amtperqty / 2;
    }
    
    file.amountPerQuantity = amtperqty;
    
    // Calculate final amount
    let finalamount = amtperqty * file.quantity;
    
    // Add spiral binding cost if selected
    if (file.spiralBinding) {
      finalamount += 20.0 * file.quantity;
    }
    
    file.finalAmount = finalamount;
    
    setFiles(updatedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleCheckout = () => {
    // Create a copy of files without the File objects
    const serializableFiles = files.map(fileData => {
      // Create a new object with all properties except 'file'
      const { fileName, fileType, fileSize, paperType, printType, ratio, format, quantity, 
              spiralBinding, totalPages, perPagePrice, amountPerQuantity, finalAmount } = fileData;
      
      return {
        fileName,
        fileType, 
        fileSize,
        paperType,
        printType,
        ratio,
        format,
        quantity,
        spiralBinding,
        totalPages,
        perPagePrice,
        amountPerQuantity,
        finalAmount
      };
    });
    
    // Store files in sessionStorage (better for larger data)
    sessionStorage.setItem('serializableFiles', JSON.stringify(serializableFiles));
    sessionStorage.setItem('totalCost', totalCost.toString());
    
    // Create a temporary object to hold File objects
    const fileObjects = {};
    files.forEach((fileData, index) => {
      // Store each File object with an index key
      fileObjects[index] = fileData.file;
    });
    
    // IMPORTANT: Store files in FileStorage object (global)
    window.FileStorage = fileObjects;
    
    // Navigate to confirmation page
    navigate('/confirm-order');
  };

  // Empty state UI when no files are selected
  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      </div>
      <h2 className="empty-state-title">Ready to print your documents?</h2>
      <p className="empty-state-text">
        Upload your PDFs or images and customize your printing options.
        We offer various paper types, color options, and binding services.
      </p>
      <div className="features-grid">
        <div className="feature">
          <div className="feature-icon">📄</div>
          <div className="feature-text">Multiple paper types</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🖨️</div>
          <div className="feature-text">B&W or color printing</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📎</div>
          <div className="feature-text">Spiral binding</div>
        </div>
        <div className="feature">
          <div className="feature-icon">💰</div>
          <div className="feature-text">Affordable pricing</div>
        </div>
      </div>
      <div className="pricing-summary">
        <h3 style={{
          textAlign:"center",
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          
        }}>Price List</h3>
        <div className="price-list">
          <div className="price-list-item">
            <span>A4 B&W (Single Side)</span>
            <span>₹1.30 per page</span>
          </div>
          <div className="price-list-item">
            <span>A4 B&W (Double Side)</span>
            <span>₹0.75 per page</span>
          </div>
          <div className="price-list-item">
            <span>A4 Color</span>
            <span>₹10.00 per page</span>
          </div>
          <div className="price-list-item">
            <span>Bonafide/OHP Paper</span>
            <span>₹15.00 per page</span>
          </div>
          <div className="price-list-item">
            <span>Spiral Binding</span>
            <span>₹20.00 per copy</span>
          </div>
        </div>
      </div>
      <label className="file-upload-button">
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          multiple
          onChange={handleFileUpload}
        />
        <span>Upload Files to Begin</span>
      </label>
    </div>
  );

  return (
    <div className="xerox-container">
      <h1 className="xerox-title">Xerox Printing Service</h1>

      {files.length === 0 ? (
        // Show empty state when no files are uploaded
        renderEmptyState()
      ) : (
        // Show file upload button when files exist
        <label className="file-upload">
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            multiple
            onChange={handleFileUpload}
          />
          <span className="file-label">Click to upload more files</span>
        </label>
      )}

      {files.map((fileData, index) => (
        <div key={index} className="file-container">
          <div className="file-header">
            <h3>{fileData.file.name} ({fileData.totalPages} pages)</h3>
            <button 
              className="remove-file-button"
              onClick={() => removeFile(index)}
            >
              ✕
            </button>
          </div>

          <div className="options-grid">
            <div className="select-container">
              <label className="select-label">Paper Type</label>
              <select
                className="select-input"
                value={fileData.paperType}
                onChange={(e) => handleChange(index, "paperType", e.target.value)}
              >
                <option value="A4">A4 Paper</option>
                <option value="Bonafide">Bonafide Paper</option>
              </select>
            </div>

            <div className="select-container">
              <label className="select-label">Color</label>
              <select
                className="select-input"
                value={fileData.printType}
                onChange={(e) => handleChange(index, "printType", e.target.value)}
              >
                <option value="black-white">Black & White</option>
                <option value="color">Gradient/Color</option>
              </select>
            </div>

            <div className="select-container">
              <label className="select-label">Format</label>
              <select
                className="select-input"
                value={fileData.format}
                onChange={(e) => handleChange(index, "format", e.target.value)}
              >
                <option value="Front Only">Front Only</option>
                <option value="Front & Back">Front & Back</option>
              </select>
            </div>

            <div className="select-container">
              <label className="select-label">Print Ratio</label>
              <select
                className="select-input"
                value={fileData.ratio}
                onChange={(e) => handleChange(index, "ratio", e.target.value)}
              >
                <option value="1:1">1:1 (Single Side)</option>
                <option value="1:2">1:2 (Double Side)</option>
              </select>
            </div>

            <div className="select-container">
              <label className="select-label">Quantity</label>
              <input
                type="number"
                className="select-input"
                min="1"
                value={fileData.quantity}
                onChange={(e) => handleChange(index, "quantity", parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="checkbox-container">
              <input
                type="checkbox"
                checked={fileData.spiralBinding}
                onChange={() => handleChange(index, "spiralBinding", !fileData.spiralBinding)}
              />
              <label>Include Spiral Binding (₹20)</label>
            </div>
          </div>

          <div className="price-info">
            <div className="price-item">
              <span className="price-label">Price per page:</span>
              <span className="price-value">₹{fileData.perPagePrice.toFixed(2)}</span>
            </div>
            <div className="price-item">
              <span className="price-label">Amount per copy:</span>
              <span className="price-value">₹{fileData.amountPerQuantity.toFixed(2)}</span>
            </div>
            <div className="price-item total">
              <span className="price-label">Final amount:</span>
              <span className="price-value">₹{fileData.finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}

      {files.length > 0 && (
        <div className="checkout-section">
          <div className="grand-total-container">
            <div className="grand-total">
              <span className="grand-total-label">Grand Total:</span>
              <span className="grand-total-value">₹{totalCost.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            className="checkout-button"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default Xerox;