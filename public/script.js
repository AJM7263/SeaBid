// // Fetch and display products
// async function fetchProducts() {
//     const response = await fetch('/products');
//     const products = await response.json();

//     const productList = document.getElementById('product-list');
//     productList.innerHTML = '';

//     products.forEach(product => {
//         const productCard = document.createElement('div');
//         productCard.className = 'product-card';
//         productCard.innerHTML = `
//             <img src="${product.image}" alt="${product.name}" width="200">
//             <h3>${product.name}</h3>
//             <p>Price: $${product.price}</p>
//             <button onclick="showProductDetails(${product.id})">View Details</button>
//             <button onclick="deleteProduct(${product.id})" class="delete-button">Delete</button>
//         `;
//         productList.appendChild(productCard);
//     });
// }

// // Show product details in a modal
// async function showProductDetails(productId) {
//     const response = await fetch(`/products/${productId}`);
//     const product = await response.json();

//     document.getElementById('product-name').textContent = product.name;
//     document.getElementById('product-image').src = product.image;
//     document.getElementById('product-description').textContent = product.description;
//     document.getElementById('product-price').textContent = product.price;
//     document.getElementById('product-weight').textContent = product.weight;
//     document.getElementById('product-date-fished').textContent = product.date_fished;

//     const orderForm = document.getElementById('order-form');
//     orderForm.onsubmit = async (e) => {
//         e.preventDefault();
//         const quantity = document.getElementById('quantity').value;

//         const orderData = {
//             product_id: product.id,
//             name: product.name,
//             price: product.price,
//             image: product.image,
//             description: product.description,
//             date_fished: product.date_fished,
//             weight: product.weight,
//             quantity,
//             order_date: new Date().toISOString().split('T')[0]
//         };

//         const orderResponse = await fetch('/orders', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(orderData)
//         });

//         if (orderResponse.ok) {
//             alert('Order placed successfully!');
//             document.getElementById('product-modal').classList.add('hidden');
//         } else {
//             alert('Failed to place order.');
//         }
//     };

//     document.getElementById('product-modal').classList.remove('hidden');
// }

// // Delete a product
// async function deleteProduct(productId) {
//     if (!confirm('Are you sure you want to delete this product?')) {
//         return;
//     }

//     try {
//         const response = await fetch(`/products/${productId}`, {
//             method: 'DELETE'
//         });

//         if (response.ok) {
//             alert('Product deleted successfully!');
//             fetchProducts(); // Refresh the product list
//         } else {
//             alert('Failed to delete product.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred while deleting the product.');
//     }
// }

// // Close the modal
// document.getElementById('close-modal').onclick = () => {
//     document.getElementById('product-modal').classList.add('hidden');
// };

// // Initialize the page
// fetchProducts();