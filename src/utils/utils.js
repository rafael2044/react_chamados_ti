const getPaginationItems = (currentPage, totalPages, pageNeighbors = 5) => {
  const totalNumbers = (pageNeighbors * 2) + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const startPage = Math.max(2, currentPage - pageNeighbors);
  const endPage = Math.min(totalPages - 1, currentPage + pageNeighbors);
  
  let pages = [currentPage];

  // Adiciona páginas vizinhas
  for (let i = startPage; i <= endPage; i++) {
    if (i !== currentPage) {
      pages.push(i);
    }
  }
  pages.sort((a, b) => a - b);

  const hasLeftSpill = startPage > 2;
  const hasRightSpill = (totalPages - endPage) > 1;

  // Adiciona o início (1 e "...")
  if (hasLeftSpill) {
    pages.unshift("...");
  }
  if (!pages.includes(1)) {
    pages.unshift(1);
  }

  // Adiciona o fim (totalPages e "...")
  if (hasRightSpill) {
    pages.push("...");
  }
  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
};

const getTotalPages = (total, limit) => {return (total + limit - 1) / limit} 

export {getPaginationItems, getTotalPages}