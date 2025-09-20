import React, { useState, useContext, useEffect } from "react";
import "./SearchPage.css";
import { StoreContext } from "../../components/Context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import { assets } from "../../assets/assets";

const SearchPage = () => {
  const { food_list } = useContext(StoreContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearching, setIsSearching] = useState(false);

  // Get unique categories from food list
  const categories = ["All", ...new Set(food_list.map(item => item.category))];

  // Search function
  const performSearch = () => {
    setIsSearching(true);
    
    const filteredResults = food_list.filter(item => {
      const name = item.name || "";
      const description = item.description || "";
      const category = item.category || "";
      const matchesQuery = searchQuery === "" || 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
    
    setSearchResults(filteredResults);
    setIsSearching(false);
  };

  // Perform search when search query or category changes
  useEffect(() => {
    performSearch();
  }, [searchQuery, selectedCategory, food_list]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1>Search Food</h1>
          <p>Find your favorite dishes from our menu</p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-group">
            <img src={assets.search_icon} alt="Search" className="search-icon" />
            <input
              type="text"
              placeholder="Search for food items, categories, or descriptions..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>

          <div className="category-filter">
            <label htmlFor="category-select">Filter by Category:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-select"
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="search-results">
          {isSearching ? (
            <div className="loading">
              <p>Searching...</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>
                  {searchQuery || selectedCategory !== "All" 
                    ? `Search Results (${searchResults.length} items found)`
                    : "All Food Items"
                  }
                </h2>
                {searchQuery && (
                  <p className="search-query">
                    Showing results for: <strong>"{searchQuery}"</strong>
                  </p>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="no-results">
                  <img src={assets.search_icon} alt="No results" className="no-results-icon" />
                  <h3>No food items found</h3>
                  <p>
                    {searchQuery 
                      ? `No items match your search for "${searchQuery}"`
                      : "No items available in this category"
                    }
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="food-display-list">
                  {searchResults.map((item, index) => (
                    <FoodItem
                      key={index}
                      id={item._id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      image={item.image}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
