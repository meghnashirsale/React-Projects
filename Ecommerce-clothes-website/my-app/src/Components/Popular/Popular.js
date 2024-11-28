import React, { useEffect, useState } from 'react';
import './Popular.css';
import Item from '../Item/Item';

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/popularinwomen')
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch popular products");
        return response.json();
      })
      .then((data) => setPopularProducts(data))
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError("Could not load popular products.");
      });
  }, []);

  return (
    <div className='popular'>
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className='popular-item'>
          {popularProducts.map((item, i) => (
            <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Popular;
