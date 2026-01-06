import React from 'react';

const ProductPagination = ({ currentPage, totalPages, paginate }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="pagination-btn prev"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }

                    return (
                        <button
                            key={pageNum}
                            className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => paginate(pageNum)}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            <button
                className="pagination-btn next"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default ProductPagination;
