import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

const ListProduct = () => {

  const [allproducts, setAllProducts] = useState([]);
  
  const fetchInfo = async () => {
    await fetch('http://localhost:4000/allproducts')
      .then((res) => res.json())
      .then((data) => { setAllProducts(data); });
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const remove_product = async (id) => {  // Accept id as a parameter
    await fetch('http://localhost:4000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })  // Send id in the body
    });
    await fetchInfo();  // Refresh the product list after deletion
  }

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="lisproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => (
          <div key={index} className='listproduct-format-main listproduct-format'>
            <img src={product.image} alt="" className='listproduct-product-icon' />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
            <p>${product.new_price}</p>
            <p>{product.category}</p>
            <img 
              onClick={() => remove_product(product.id)} // Corrected function call
              className='listproduct-remove-icon' 
              src={cross_icon} 
              alt="Remove Product" 
            />
            <hr />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListProduct;
