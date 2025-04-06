// DOI validation and citation formatting

// CrossRef API endpoint
const CROSSREF_API_URL = 'https://api.crossref.org/works/';

// Function to validate a DOI
export const validateDOI = async (doi: string): Promise<boolean> => {
  try {
    const response = await fetch(`${CROSSREF_API_URL}${encodeURIComponent(doi)}`);
    return response.ok;
  } catch (error) {
    console.error('Error validating DOI:', error);
    return false;
  }
};

// Function to get metadata for a DOI
const getDoiMetadata = async (doi: string) => {
  try {
    const response = await fetch(`${CROSSREF_API_URL}${encodeURIComponent(doi)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch DOI metadata: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error getting DOI metadata:', error);
    throw error;
  }
};

// Function to format authors based on citation style
const formatAuthors = (authors: any[], style: string): string => {
  if (!authors || authors.length === 0) {
    return 'Unknown Author';
  }

  switch (style) {
    case 'APA':
      if (authors.length === 1) {
        return `${authors[0].family}, ${authors[0].given.charAt(0)}.`;
      } else if (authors.length === 2) {
        return `${authors[0].family}, ${authors[0].given.charAt(0)}., & ${authors[1].family}, ${authors[1].given.charAt(0)}.`;
      } else {
        return `${authors[0].family}, ${authors[0].given.charAt(0)}., et al.`;
      }
    
    case 'MLA':
      if (authors.length === 1) {
        return `${authors[0].family}, ${authors[0].given}.`;
      } else if (authors.length === 2) {
        return `${authors[0].family}, ${authors[0].given}, and ${authors[1].given} ${authors[1].family}.`;
      } else {
        return `${authors[0].family}, ${authors[0].given}, et al.`;
      }
    
    case 'Chicago':
      if (authors.length === 1) {
        return `${authors[0].family}, ${authors[0].given}.`;
      } else if (authors.length === 2) {
        return `${authors[0].family}, ${authors[0].given}, and ${authors[1].given} ${authors[1].family}.`;
      } else {
        return `${authors[0].family}, ${authors[0].given}, et al.`;
      }
    
    case 'Harvard':
      if (authors.length === 1) {
        return `${authors[0].family}, ${authors[0].given.charAt(0)}.`;
      } else if (authors.length === 2) {
        return `${authors[0].family}, ${authors[0].given.charAt(0)}. and ${authors[1].family}, ${authors[1].given.charAt(0)}.`;
      } else {
        return `${authors[0].family}, ${authors[0].given.charAt(0)}. et al.`;
      }
    
    default:
      return authors.map(author => `${author.family}, ${author.given.charAt(0)}.`).join(', ');
  }
};

// Function to format citation based on style
export const formatCitation = async (doi: string, style: string): Promise<string> => {
  try {
    const metadata = await getDoiMetadata(doi);
    
    if (!metadata) {
      throw new Error('No metadata found for the given DOI');
    }
    
    const { author, title, 'container-title': journal, volume, issue, page, published } = metadata;
    const year = published?.['date-parts']?.[0]?.[0] || 'n.d.';
    
    const formattedAuthors = formatAuthors(author, style);
    
    switch (style) {
      case 'APA':
        return `${formattedAuthors} (${year}). ${title}. <em>${journal?.[0] || ''}</em>${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${page ? `, ${page}` : ''}. https://doi.org/${doi}`;
      
      case 'MLA':
        return `${formattedAuthors} "${title}." <em>${journal?.[0] || ''}</em>${volume ? ` ${volume}` : ''}${issue ? `.${issue}` : ''}${page ? ` (${year}): ${page}` : ` (${year})`}. https://doi.org/${doi}`;
      
      case 'Chicago':
        return `${formattedAuthors} "${title}." <em>${journal?.[0] || ''}</em>${volume ? ` ${volume}` : ''}${issue ? `, no. ${issue}` : ''}${page ? ` (${year}): ${page}` : ` (${year})`}. https://doi.org/${doi}`;
      
      case 'Harvard':
        return `${formattedAuthors} ${year}. ${title}. <em>${journal?.[0] || ''}</em>${volume ? ` ${volume}` : ''}${issue ? `(${issue})` : ''}${page ? `, ${page}` : ''}. Available at: https://doi.org/${doi}`;
      
      default:
        return `${formattedAuthors} (${year}). ${title}. ${journal?.[0] || ''}${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${page ? `, ${page}` : ''}. https://doi.org/${doi}`;
    }
  } catch (error) {
    console.error('Error formatting citation:', error);
    throw error;
  }
};
