import './App.css';
import React, {useState, useEffect, useMemo} from "react"
import classnames from 'classnames';
import { usePagination, DOTS } from './usePagination';


const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    console.log("*** requestSort", key, sortConfig);
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

// eslint-disable-next-line no-unused-vars
const SpaceTable = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { items, requestSort, sortConfig } = useSortableData(props.space);

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };


  // eslint-disable-next-line no-unused-vars
  const [filteredData, setFilteredData] = useState(items);
  
  // 搜尋事件
  const handleSearch = (event) => {
    let value = event.target.value.toLowerCase();
    let result = [];
    console.log(value);
    result = items.filter((data) => {
    return data.mission_name.search(value) !== -1;
    });
    setFilteredData(result);
    }

  return(
    <div>
    <div>
    <input type="text" placeholder='Search for...' onChange={(event) =>handleSearch(event)} />
    </div>
    <table>
      <caption>Space List</caption>
      <thead>
        <tr>
          <th>
            <button type="button" onClick={() => requestSort('mission_name')} className={getClassNamesFor('mission_name')}>
             Mission Name
            </button>
          </th>
          <th>
            <button type="button" onClick={() => requestSort('rocket_name')} className={getClassNamesFor('rocket_name')}>
            Rocket Name
            </button>
          </th>
          <th>
            <button type="button" onClick={() => requestSort('rocket_type')} className={getClassNamesFor('rocket_type')}>
            Rocket Name
            </button>
          </th>
          <th>
            <button type="button" onClick={() => requestSort('launch_date_local')} className={getClassNamesFor('launch_date_local')}>
            Launch Date
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => {
          return(
            <tr key={item.id}>
              <td>{item.mission_name}</td>
              <td>{item.rocket.rocket_name}</td>
              <td>{item.rocket.rocket_type}</td>
              <td>{item.launch_date_local.substring(0,10)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  )
};

// ---------------------------分頁------------------------------------

const Pagination = props => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className
  } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];
  return (
    <ul
      className={classnames('pagination-container', { [className]: className })}
    >
      <li 
        className={classnames('pagination-item', {
          disabled: currentPage === 1
        })}
        onClick={onPrevious}
      >
        <div className="arrow left" />
      </li>
      {paginationRange.map(pageNumber => {
        if (pageNumber === DOTS) {
          return <li className="pagination-item dots">&#8230;</li>;
        }

        return (
          <li
            className={classnames('pagination-item', {
              selected: pageNumber === currentPage
            })}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      <li
        className={classnames('pagination-item', {
          disabled: currentPage === lastPage
        })}
        onClick={onNext}
      >
        <div className="arrow right" />
      </li>
    </ul>
  );
};

// -----------------------------End---------------------------------------

// ----------------------------Search-------------------------------------



// -------------------------------End-------------------------------------



let PageSize = 20

export default function SpaceList() {
  const [space, setSpace] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [filteredData, setFilteredData] = useState(space);

  useEffect(() => {
    //fetch json data
    fetch("http://localhost:3000/data")
      .then((res) => res.json())
      .then((data) => setSpace(data.launches)) 
      .then((data) => setFilteredData(data.launches))

    // 給予第二個參數為空陣列
  }, []);
  // console.log(space)

  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line no-unused-vars
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return space.slice(firstPageIndex, lastPageIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);
  

  return (
    
    <div className="App">
      <SpaceTable
        space={currentTableData}

      />
      <Pagination 
        className="pagination-bar"
        currentPage={currentPage}
        totalCount={space.length}
        pageSize={PageSize}
        onPageChange={page => setCurrentPage(page)}
      />
    </div>
  );
}

