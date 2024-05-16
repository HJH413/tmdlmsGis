import React, {createContext, useContext, useState} from 'react';

const SearchContext = createContext();

export const useSearchContext = () => useContext(SearchContext);

export const SearchProvider = ({children}) => {
    const [searchData, setSearchData] = useState({
        address: '',
        basin: '',
        sBasin: ''
    });

    return (
        <SearchContext.Provider value={{searchData, setSearchData}}>
            {children}
        </SearchContext.Provider>
    );
};