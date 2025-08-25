/**
 * @fileoverview Export and import manager for Croatian Labor Law database
 * Provides PDF generation, CSV export/import, and data exchange functionality
 * @version 2.1.0
 */

/**
 * @typedef {Object} ExportOptions
 * @property {string} format - Export format: 'pdf', 'csv', 'json', 'xml'
 * @property {string[]} [fields] - Fields to include in export
 * @property {string[]} [categories] - Categories to filter
 * @property {string} [language='hr'] - Language for export
 * @property {boolean} [includeTranslations=false] - Include all translations
 * @property {boolean} [includeMetadata=true] - Include metadata
 * @property {Object} [styling] - Styling options for PDF
 */

/**
 * @typedef {Object} ImportOptions
 * @property {string} format - Import format: 'csv', 'json', 'xml'
 * @property {boolean} [validateData=true] - Validate imported data
 * @property {boolean} [mergeExisting=false] - Merge with existing data
 * @property {string} [defaultLanguage='hr'] - Default language for import
 * @property {Object} [fieldMapping] - Field mapping for CSV import
 */

/**
 * @typedef {Object} ExportResult
 * @property {boolean} success - Export success status
 * @property {string|Blob} data - Exported data
 * @property {string} filename - Suggested filename
 * @property {string} mimeType - MIME type of exported data
 * @property {number} recordCount - Number of exported records
 * @property {string[]} [errors] - Export errors if any
 */

/**
 * @typedef {Object} ImportResult
 * @property {boolean} success - Import success status
 * @property {number} imported - Number of imported records
 * @property {number} updated - Number of updated records
 * @property {number} errors - Number of errors
 * @property {string[]} errorMessages - Error messages
 * @property {Object[]} validationErrors - Detailed validation errors
 */

/**
 * Export and import manager for comprehensive data exchange
 */
export class ExportManager {
    constructor(options = {}) {
        this.options = {
            maxExportSize: 10000, // Maximum records per export
            pdfPageSize: 'A4',
            pdfMargins: { top: 20, right: 20, bottom: 20, left: 20 },
            csvDelimiter: ',',
            csvEncoding: 'UTF-8',
            includeHeaders: true,
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'HH:mm:ss',
            ...options
        };
        
        // Default field configurations
        this.fieldConfigs = {
            pdf: {
                fields: ['id', 'title', 'content', 'category', 'keywords', 'lastModified'],
                maxContentLength: 500,
                includePageNumbers: true,
                includeTableOfContents: true
            },
            csv: {
                fields: ['id', 'title', 'category', 'keywords', 'lastModified'],
                flattenArrays: true,
                escapeSpecialChars: true
            },
            json: {
                includeAll: true,
                prettyPrint: true,
                compression: false
            },
            xml: {
                rootElement: 'croatianLaborLaw',
                articleElement: 'article',
                includeSchema: true
            }
        };
        
        // PDF styling defaults
        this.pdfStyles = {
            title: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: 10
            },
            heading: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#34495e',
                marginTop: 15,
                marginBottom: 8
            },
            content: {
                fontSize: 11,
                lineHeight: 1.4,
                color: '#2c3e50',
                marginBottom: 10
            },
            metadata: {
                fontSize: 9,
                color: '#7f8c8d',
                fontStyle: 'italic'
            }
        };
        
        // Import validation rules
        this.importRules = {
            required: ['id', 'title', 'content'],
            optional: ['category', 'keywords', 'lastModified'],
            maxFieldLengths: {
                id: 100,
                title: 500,
                content: 50000,
                category: 100
            }
        };
    }

    /**
     * Export articles to specified format
     * @param {Array} articles - Articles to export
     * @param {ExportOptions} options - Export options
     * @returns {Promise<ExportResult>} Export result
     */
    async exportArticles(articles, options = {}) {
        const exportOptions = { ...this.options, ...options };
        
        try {
            // Validate export parameters
            if (!articles || !Array.isArray(articles)) {
                throw new Error('Articles must be an array');
            }
            
            if (articles.length > exportOptions.maxExportSize) {
                throw new Error(`Export size exceeds maximum limit of ${exportOptions.maxExportSize}`);
            }
            
            // Filter and prepare articles
            const preparedArticles = this.prepareArticlesForExport(articles, exportOptions);
            
            // Export based on format
            let result;
            switch (exportOptions.format.toLowerCase()) {
                case 'pdf':
                    result = await this.exportToPDF(preparedArticles, exportOptions);
                    break;
                case 'csv':
                    result = await this.exportToCSV(preparedArticles, exportOptions);
                    break;
                case 'json':
                    result = await this.exportToJSON(preparedArticles, exportOptions);
                    break;
                case 'xml':
                    result = await this.exportToXML(preparedArticles, exportOptions);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${exportOptions.format}`);
            }
            
            return {
                success: true,
                ...result,
                recordCount: preparedArticles.length
            };
            
        } catch (error) {
            return {
                success: false,
                data: null,
                filename: null,
                mimeType: null,
                recordCount: 0,
                errors: [error.message]
            };
        }
    }

    /**
     * Prepare articles for export
     * @param {Array} articles - Original articles
     * @param {ExportOptions} options - Export options
     * @returns {Array} Prepared articles
     * @private
     */
    prepareArticlesForExport(articles, options) {
        let prepared = [...articles];
        
        // Filter by categories
        if (options.categories && options.categories.length > 0) {
            prepared = prepared.filter(article => 
                options.categories.includes(article.category)
            );
        }
        
        // Process each article
        prepared = prepared.map(article => {
            const processedArticle = { ...article };
            
            // Handle translations
            if (!options.includeTranslations && processedArticle.translations) {
                if (options.language && processedArticle.translations[options.language]) {
                    // Use specific language translation
                    const translation = processedArticle.translations[options.language];
                    processedArticle.title = translation.title;
                    processedArticle.content = translation.content;
                    if (translation.keywords) {
                        processedArticle.keywords = translation.keywords;
                    }
                }
                delete processedArticle.translations;
            }
            
            // Filter fields if specified
            if (options.fields && options.fields.length > 0) {
                const filteredArticle = {};
                options.fields.forEach(field => {
                    if (processedArticle[field] !== undefined) {
                        filteredArticle[field] = processedArticle[field];
                    }
                });
                return filteredArticle;
            }
            
            // Remove metadata if not included
            if (!options.includeMetadata) {
                delete processedArticle.lastModified;
                delete processedArticle.precedingArticles;
                delete processedArticle.followingArticles;
            }
            
            return processedArticle;
        });
        
        return prepared;
    }

    /**
     * Export to PDF format
     * @param {Array} articles - Articles to export
     * @param {ExportOptions} options - Export options
     * @returns {Promise<Object>} Export result
     * @private
     */
    async exportToPDF(articles, options) {
        // Note: This is a simplified implementation
        // In a real application, you would use a library like jsPDF or PDFKit
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `croatian-labor-law-${timestamp}.pdf`;
        
        try {
            // Create PDF content structure
            const pdfContent = this.generatePDFContent(articles, options);
            
            // For this implementation, we'll create a simple HTML structure
            // that can be printed to PDF by the browser
            const htmlContent = this.generatePDFHTML(pdfContent, options);
            
            return {
                data: htmlContent, // In real implementation, this would be a PDF Blob
                filename,
                mimeType: 'application/pdf'
            };
            
        } catch (error) {
            throw new Error(`PDF export failed: ${error.message}`);
        }
    }

    /**
     * Generate PDF content structure
     * @param {Array} articles - Articles to include
     * @param {ExportOptions} options - Export options
     * @returns {Object} PDF content structure
     * @private
     */
    generatePDFContent(articles, options) {
        const content = {
            title: 'Croatian Labor Law Articles',
            subtitle: `Export generated on ${new Date().toLocaleDateString()}`,
            sections: []
        };
        
        // Group articles by category
        const articlesByCategory = {};
        articles.forEach(article => {
            const category = article.category || 'Uncategorized';
            if (!articlesByCategory[category]) {
                articlesByCategory[category] = [];
            }
            articlesByCategory[category].push(article);
        });
        
        // Create sections for each category
        Object.entries(articlesByCategory).forEach(([category, categoryArticles]) => {
            const section = {
                title: this.formatCategoryTitle(category),
                articles: categoryArticles.map(article => ({
                    id: article.id,
                    title: article.title,
                    content: this.truncateContent(article.content, this.fieldConfigs.pdf.maxContentLength),
                    keywords: Array.isArray(article.keywords) ? article.keywords.join(', ') : '',
                    lastModified: article.lastModified ? new Date(article.lastModified).toLocaleDateString() : ''
                }))
            };
            content.sections.push(section);
        });
        
        return content;
    }

    /**
     * Generate HTML for PDF conversion
     * @param {Object} content - PDF content structure
     * @param {ExportOptions} options - Export options
     * @returns {string} HTML content
     * @private
     */
    generatePDFHTML(content, options) {
        return `
<!DOCTYPE html>
<html lang="hr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3498db;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #7f8c8d;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2980b9;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 20px;
        }
        .article {
            margin-bottom: 25px;
            border-left: 3px solid #ecf0f1;
            padding-left: 15px;
        }
        .article-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        .article-content {
            font-size: 12px;
            margin-bottom: 10px;
            text-align: justify;
        }
        .article-meta {
            font-size: 10px;
            color: #7f8c8d;
            font-style: italic;
        }
        .keywords {
            background-color: #f8f9fa;
            padding: 5px;
            border-radius: 3px;
            font-size: 10px;
        }
        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${content.title}</div>
        <div class="subtitle">${content.subtitle}</div>
    </div>
    
    ${content.sections.map(section => `
        <div class="section">
            <div class="section-title">${section.title}</div>
            ${section.articles.map(article => `
                <div class="article">
                    <div class="article-title">${article.title}</div>
                    <div class="article-content">${article.content}</div>
                    ${article.keywords ? `<div class="keywords"><strong>Keywords:</strong> ${article.keywords}</div>` : ''}
                    ${article.lastModified ? `<div class="article-meta">Last modified: ${article.lastModified}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;
    }

    /**
     * Export to CSV format
     * @param {Array} articles - Articles to export
     * @param {ExportOptions} options - Export options
     * @returns {Promise<Object>} Export result
     * @private
     */
    async exportToCSV(articles, options) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `croatian-labor-law-${timestamp}.csv`;
        
        try {
            const csvConfig = this.fieldConfigs.csv;
            const fields = options.fields || csvConfig.fields;
            
            // Generate headers
            let csvContent = '';
            if (this.options.includeHeaders) {
                csvContent += fields.join(this.options.csvDelimiter) + '\n';
            }
            
            // Generate rows
            for (const article of articles) {
                const row = fields.map(field => {
                    let value = article[field];
                    
                    // Handle arrays
                    if (Array.isArray(value)) {
                        value = csvConfig.flattenArrays ? value.join('; ') : JSON.stringify(value);
                    }
                    
                    // Handle objects
                    if (typeof value === 'object' && value !== null) {
                        value = JSON.stringify(value);
                    }
                    
                    // Handle undefined/null
                    if (value === undefined || value === null) {
                        value = '';
                    }
                    
                    // Convert to string and escape
                    value = String(value);
                    if (csvConfig.escapeSpecialChars) {
                        value = this.escapeCSV(value);
                    }
                    
                    return value;
                });
                
                csvContent += row.join(this.options.csvDelimiter) + '\n';
            }
            
            return {
                data: csvContent,
                filename,
                mimeType: 'text/csv'
            };
            
        } catch (error) {
            throw new Error(`CSV export failed: ${error.message}`);
        }
    }

    /**
     * Export to JSON format
     * @param {Array} articles - Articles to export
     * @param {ExportOptions} options - Export options
     * @returns {Promise<Object>} Export result
     * @private
     */
    async exportToJSON(articles, options) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `croatian-labor-law-${timestamp}.json`;
        
        try {
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '2.1.0',
                    totalArticles: articles.length,
                    language: options.language || 'hr',
                    includeTranslations: options.includeTranslations || false
                },
                articles: articles
            };
            
            const jsonConfig = this.fieldConfigs.json;
            const jsonString = jsonConfig.prettyPrint ? 
                JSON.stringify(exportData, null, 2) : 
                JSON.stringify(exportData);
            
            return {
                data: jsonString,
                filename,
                mimeType: 'application/json'
            };
            
        } catch (error) {
            throw new Error(`JSON export failed: ${error.message}`);
        }
    }

    /**
     * Export to XML format
     * @param {Array} articles - Articles to export
     * @param {ExportOptions} options - Export options
     * @returns {Promise<Object>} Export result
     * @private
     */
    async exportToXML(articles, options) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `croatian-labor-law-${timestamp}.xml`;
        
        try {
            const xmlConfig = this.fieldConfigs.xml;
            
            let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
            
            if (xmlConfig.includeSchema) {
                xmlContent += '<!-- Croatian Labor Law Articles Export -->\n';
                xmlContent += `<!-- Generated on ${new Date().toISOString()} -->\n`;
            }
            
            xmlContent += `<${xmlConfig.rootElement}>\n`;
            xmlContent += '  <metadata>\n';
            xmlContent += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
            xmlContent += `    <version>2.1.0</version>\n`;
            xmlContent += `    <totalArticles>${articles.length}</totalArticles>\n`;
            xmlContent += '  </metadata>\n';
            xmlContent += '  <articles>\n';
            
            for (const article of articles) {
                xmlContent += `    <${xmlConfig.articleElement}>\n`;
                xmlContent += this.objectToXML(article, '      ');
                xmlContent += `    </${xmlConfig.articleElement}>\n`;
            }
            
            xmlContent += '  </articles>\n';
            xmlContent += `</${xmlConfig.rootElement}>\n`;
            
            return {
                data: xmlContent,
                filename,
                mimeType: 'application/xml'
            };
            
        } catch (error) {
            throw new Error(`XML export failed: ${error.message}`);
        }
    }

    /**
     * Import articles from various formats
     * @param {string|File} data - Data to import
     * @param {ImportOptions} options - Import options
     * @returns {Promise<ImportResult>} Import result
     */
    async importArticles(data, options = {}) {
        const importOptions = { ...this.options, ...options };
        
        try {
            let parsedData;
            
            // Parse data based on format
            switch (importOptions.format.toLowerCase()) {
                case 'csv':
                    parsedData = await this.parseCSV(data, importOptions);
                    break;
                case 'json':
                    parsedData = await this.parseJSON(data, importOptions);
                    break;
                case 'xml':
                    parsedData = await this.parseXML(data, importOptions);
                    break;
                default:
                    throw new Error(`Unsupported import format: ${importOptions.format}`);
            }
            
            // Validate imported data
            const validationResult = importOptions.validateData ? 
                await this.validateImportedData(parsedData, importOptions) : 
                { valid: parsedData, errors: [] };
            
            return {
                success: true,
                imported: validationResult.valid.length,
                updated: 0, // TODO: Implement merge logic
                errors: validationResult.errors.length,
                errorMessages: validationResult.errors,
                validationErrors: validationResult.errors
            };
            
        } catch (error) {
            return {
                success: false,
                imported: 0,
                updated: 0,
                errors: 1,
                errorMessages: [error.message],
                validationErrors: []
            };
        }
    }

    /**
     * Parse CSV data
     * @param {string} csvData - CSV data to parse
     * @param {ImportOptions} options - Import options
     * @returns {Promise<Array>} Parsed articles
     * @private
     */
    async parseCSV(csvData, options) {
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('Empty CSV data');
        }
        
        // Parse headers
        const headers = this.parseCSVLine(lines[0]);
        const dataLines = this.options.includeHeaders ? lines.slice(1) : lines;
        
        const articles = [];
        
        for (let i = 0; i < dataLines.length; i++) {
            try {
                const values = this.parseCSVLine(dataLines[i]);
                if (values.length !== headers.length) {
                    console.warn(`Line ${i + 2}: Column count mismatch`);
                    continue;
                }
                
                const article = {};
                headers.forEach((header, index) => {
                    const value = values[index];
                    
                    // Apply field mapping if provided
                    const fieldName = options.fieldMapping && options.fieldMapping[header] ? 
                        options.fieldMapping[header] : header;
                    
                    // Parse value based on field type
                    article[fieldName] = this.parseCSVValue(value, fieldName);
                });
                
                articles.push(article);
                
            } catch (error) {
                console.warn(`Error parsing line ${i + 2}: ${error.message}`);
            }
        }
        
        return articles;
    }

    /**
     * Parse JSON data
     * @param {string} jsonData - JSON data to parse
     * @param {ImportOptions} options - Import options
     * @returns {Promise<Array>} Parsed articles
     * @private
     */
    async parseJSON(jsonData, options) {
        try {
            const parsed = JSON.parse(jsonData);
            
            // Handle different JSON structures
            if (Array.isArray(parsed)) {
                return parsed;
            }
            
            if (parsed.articles && Array.isArray(parsed.articles)) {
                return parsed.articles;
            }
            
            if (typeof parsed === 'object') {
                return [parsed]; // Single article
            }
            
            throw new Error('Invalid JSON structure');
            
        } catch (error) {
            throw new Error(`JSON parsing failed: ${error.message}`);
        }
    }

    /**
     * Parse XML data
     * @param {string} xmlData - XML data to parse
     * @param {ImportOptions} options - Import options
     * @returns {Promise<Array>} Parsed articles
     * @private
     */
    async parseXML(xmlData, options) {
        // Note: This is a simplified XML parser
        // In a real application, you would use DOMParser or a proper XML library
        
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
            
            const articleElements = xmlDoc.querySelectorAll('article');
            const articles = [];
            
            articleElements.forEach(element => {
                const article = this.xmlElementToObject(element);
                articles.push(article);
            });
            
            return articles;
            
        } catch (error) {
            throw new Error(`XML parsing failed: ${error.message}`);
        }
    }

    /**
     * Validate imported data
     * @param {Array} articles - Articles to validate
     * @param {ImportOptions} options - Import options
     * @returns {Promise<Object>} Validation result
     * @private
     */
    async validateImportedData(articles, options) {
        const validArticles = [];
        const errors = [];
        
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const articleErrors = [];
            
            // Check required fields
            this.importRules.required.forEach(field => {
                if (!article[field] || String(article[field]).trim() === '') {
                    articleErrors.push(`Missing required field: ${field}`);
                }
            });
            
            // Check field lengths
            Object.entries(this.importRules.maxFieldLengths).forEach(([field, maxLength]) => {
                if (article[field] && String(article[field]).length > maxLength) {
                    articleErrors.push(`Field ${field} exceeds maximum length of ${maxLength}`);
                }
            });
            
            // Add default language if not specified
            if (!article.language) {
                article.language = options.defaultLanguage || 'hr';
            }
            
            if (articleErrors.length === 0) {
                validArticles.push(article);
            } else {
                errors.push(`Article ${i + 1}: ${articleErrors.join(', ')}`);
            }
        }
        
        return {
            valid: validArticles,
            errors
        };
    }

    /**
     * Helper method to escape CSV values
     * @param {string} value - Value to escape
     * @returns {string} Escaped value
     * @private
     */
    escapeCSV(value) {
        if (value.includes(this.options.csvDelimiter) || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    /**
     * Parse CSV line
     * @param {string} line - CSV line to parse
     * @returns {string[]} Parsed values
     * @private
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === this.options.csvDelimiter && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    /**
     * Parse CSV value based on field type
     * @param {string} value - Value to parse
     * @param {string} fieldName - Field name
     * @returns {any} Parsed value
     * @private
     */
    parseCSVValue(value, fieldName) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }
        
        // Handle arrays (semicolon-separated)
        if (fieldName === 'keywords' && value.includes(';')) {
            return value.split(';').map(item => item.trim()).filter(item => item);
        }
        
        // Handle JSON objects/arrays
        if (value.startsWith('{') || value.startsWith('[')) {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        
        return value;
    }

    /**
     * Convert object to XML
     * @param {Object} obj - Object to convert
     * @param {string} indent - Indentation
     * @returns {string} XML string
     * @private
     */
    objectToXML(obj, indent = '') {
        let xml = '';
        
        Object.entries(obj).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                return;
            }
            
            xml += `${indent}<${key}>`;
            
            if (Array.isArray(value)) {
                xml += '\n';
                value.forEach(item => {
                    xml += `${indent}  <item>`;
                    if (typeof item === 'object') {
                        xml += '\n' + this.objectToXML(item, indent + '    ') + indent + '  ';
                    } else {
                        xml += this.escapeXML(String(item));
                    }
                    xml += '</item>\n';
                });
                xml += indent;
            } else if (typeof value === 'object') {
                xml += '\n' + this.objectToXML(value, indent + '  ') + indent;
            } else {
                xml += this.escapeXML(String(value));
            }
            
            xml += `</${key}>\n`;
        });
        
        return xml;
    }

    /**
     * Convert XML element to object
     * @param {Element} element - XML element
     * @returns {Object} Converted object
     * @private
     */
    xmlElementToObject(element) {
        const obj = {};
        
        // Handle attributes
        if (element.attributes) {
            for (const attr of element.attributes) {
                obj[`@${attr.name}`] = attr.value;
            }
        }
        
        // Handle child elements
        for (const child of element.children) {
            const key = child.tagName;
            const value = child.children.length > 0 ? 
                this.xmlElementToObject(child) : 
                child.textContent;
            
            if (obj[key]) {
                // Convert to array if multiple elements with same name
                if (!Array.isArray(obj[key])) {
                    obj[key] = [obj[key]];
                }
                obj[key].push(value);
            } else {
                obj[key] = value;
            }
        }
        
        return obj;
    }

    /**
     * Escape XML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     * @private
     */
    escapeXML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Format category title for display
     * @param {string} category - Category name
     * @returns {string} Formatted title
     * @private
     */
    formatCategoryTitle(category) {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Truncate content to specified length
     * @param {string} content - Content to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated content
     * @private
     */
    truncateContent(content, maxLength) {
        if (!content || content.length <= maxLength) {
            return content || '';
        }
        
        const truncated = content.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > maxLength * 0.8 ? 
            truncated.substring(0, lastSpace) + '...' : 
            truncated + '...';
    }

    /**
     * Get supported export formats
     * @returns {string[]} Supported formats
     */
    getSupportedExportFormats() {
        return ['pdf', 'csv', 'json', 'xml'];
    }

    /**
     * Get supported import formats
     * @returns {string[]} Supported formats
     */
    getSupportedImportFormats() {
        return ['csv', 'json', 'xml'];
    }

    /**
     * Get export statistics
     * @returns {Object} Export statistics
     */
    getExportStats() {
        return {
            supportedExportFormats: this.getSupportedExportFormats(),
            supportedImportFormats: this.getSupportedImportFormats(),
            maxExportSize: this.options.maxExportSize,
            defaultFieldConfigs: this.fieldConfigs
        };
    }
}

export default ExportManager;
