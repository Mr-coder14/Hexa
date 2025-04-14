import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "./firebase"; 
import { ref, push, set, get } from "firebase/database";
import "../css/Home.css";


const REVERSE_IMAGE_MAPPING = {
  "casio991.jpg": "2131230957",
  "caltrix.jpg": "2131230902",
  "graphh.png": "2131230999",
  "xooblack.png": "2131231165",
  "xoblue.png": "2131231164",
  "stylishpenblue.jpg": "2131231144",
  "stylishblackpen.png": "2131231143",
  "athreenotee.jpg": "2131230843",
  "tippencil.png": "2131231148",
  "bipolar.jpg": "2131230882",
  "tipbox.png": "2131231147"
};

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleProductClick = (product) => {
    navigate("/product", { state: { product } });
  };

  // Add useEffect to check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      // If user is logged in, fetch their cart items
      if (currentUser) {
        const userCartRef = ref(database, `userscart/${currentUser.uid}`);
        get(userCartRef).then((snapshot) => {
          if (snapshot.exists()) {
            const items = [];
            snapshot.forEach((childSnapshot) => {
              items.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
              });
            });
            setCartItems(items);
          }
        }).catch((error) => {
          console.error("Error fetching cart items:", error);
        });
      } else {
        // Clear cart items when user logs out
        setCartItems([]);
      }
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const isProductInCart = (product) => {
    return cartItems.some(item => item.productname === product.name);
  };

  const getImageIdForFilename = (filename) => {
    // Find the image ID from the reverse mapping
    return REVERSE_IMAGE_MAPPING[filename] || "0"; // Default to "0" if not found
  };

  const showNotificationAlert = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const addToCart = (e, product) => {
    e.stopPropagation(); // Prevent triggering the product click
    e.preventDefault(); // Prevent default anchor behavior
    
    if (!user) {
      showNotificationAlert("Please login to add items to cart");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    
    // Check if product is already in cart
    if (isProductInCart(product)) {
      showNotificationAlert("This product is already in your cart!");
      return;
    }
    
    // Get image ID directly from the reverse mapping using the product's image filename
    const imageId = getImageIdForFilename(product.img);
    
    // If no matching ID was found, log an error
    if (imageId === "0") {
      console.warn(`No image ID found for ${product.img}`);
    }
    
    // Prepare product data for Firebase
    const productData = {
      productname: product.name,
      productimage: parseInt(imageId, 10), // Store the numerical image ID 
      productamt: product.price.replace('₹', ''),
      qty: 1,
      rating: 0,
      discription: `Brand: ${product.brand}, Product: ${product.name}`
    };
    
    console.log(`Adding product with image: ${product.img}, ID: ${imageId}`);
    
    // Get reference to the user's cart
    const userCartRef = ref(database, `userscart/${user.uid}`);
    
    // Create a new unique entry for this product
    const newProductRef = push(userCartRef);
    
    // Set the product data in Firebase
    set(newProductRef, productData)
      .then(() => {
        showNotificationAlert("Product added to cart successfully!");
        // Add the new item to local cart items state to update UI
        setCartItems([...cartItems, { 
          id: newProductRef.key, 
          ...productData 
        }]);
      })
      .catch((error) => {
        console.error("Error adding to cart: ", error);
        showNotificationAlert("Failed to add product to cart. Please try again.");
      });
  };

  return (
    <>
      {showNotification && (
        <div className="notification-popuphome">
          <p className="notification-texthome">{notificationMessage}</p>
        </div>
      )}
      
      <section id="mainhome" className="section-mainhome">
        <div className="hero-contenthome">
          <h2 className="fade-inhome h2home" style={{color:"#465b52"}}>Welcome To</h2>
          <h1 className="slide-inhome h1home">Jasa Essential</h1>
          <p className="fade-in-delayhome paragraph-texthome">Save more with coupons & up to 70% off!</p>
          <button className="btnhome pulsehome" onClick={() => navigate("/shop")}>
            Shop Now <i className="bx bx-right-arrow-alt icon-arrowhome"></i>
          </button>
        </div>
      </section>

      <section id="featurehome" className="section-p1home">
        {[
          { img: "f1.png", text: "Free Shipping", icon: "bx-package" },
          { img: "f2.png", text: "Online Order", icon: "bx-cart" },
          { img: "f3.png", text: "Save Money", icon: "bx-wallet" },
          { img: "f4.png", text: "Promotions", icon: "bx-gift" },
          { img: "f5.png", text: "Happy Sell", icon: "bx-happy-heart-eyes" },
          { img: "f6.png", text: "24/7 Support", icon: "bx-support" },
        ].map((feature, index) => (
          <div className="fe-boxhome" key={index}>
            <div className="feature-iconhome">
              <i className={`bx ${feature.icon} icon-featurehome`}></i>
            </div>
            <img className="feature-imagehome" src={feature.img} alt={feature.text} />
            <h6 className="feature-texthome">{feature.text}</h6>
          </div>
        ))}
      </section>

      <div className="wave-dividerhome">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="wave-svghome">
          <path fill="#e3e6f3" fillOpacity="0.4" d="M0,32L48,48C96,64,192,96,288,96C384,96,480,64,576,48C672,32,768,32,864,48C960,64,1056,96,1152,96C1248,96,1344,64,1392,48L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <section id="product1home" className="section-p1home">
        <h2 className="product-headinghome">Featured Products</h2>
        <p className="product-subheadinghome">Essential Stationery for Every Student</p>
        <div className="pro-containerhome">
          {[
            {
              img: "casio991.jpg",
              brand: "Casio",
              name: "FX-991MS Scientific Calculator",
              price: "₹1165",
            },
            {
              img: "caltrix.jpg",
              brand: "Caltrix",
              name: "CX-991S Scientific Calculator",
              price: "₹600",
            },
            {
              img: "graphh.png",
              brand: "SVE SIDDHI VINAYAK ENTERPRISES",
              name: "Graph Notebook - A4 Size, 100 Pages",
              price: "₹100",
            },
            {
              img: "xooblack.png",
              brand: "Hauser",
              name: "XO Ball Pen - Black Ink",
              price: "₹10",
            },
            {
              img: "xoblue.png",
              brand: "Hauser",
              name: "XO Ball Pen - Blue Ink",
              price: "₹10",
            },
            {
              img: "stylishpenblue.jpg",
              brand: "Stylish",
              name: "X3 Ball Pen - Blue (0.7mm)",
              price: "₹7",
            },
            {
              img: "stylishblackpen.png",
              brand: "Stylish",
              name: "X3 Ball Pen - Black (0.7mm)",
              price: "₹7",
            },
            {
              img: "athreenotee.jpg",
              brand: "Jasa Essential",
              name: "A3 Drawing Book",
              price: "₹80",
            },
            {
              img: "tippencil.png",
              brand: "Faber-Castell",
              name: "Tri-Click Mechanical Pencil 0.7mm",
              price: "₹15",
            },
            {
              img: "bipolar.jpg",
              brand: "Jasa Essential",
              name: "Bipolar Graph Book (100 sheets)",
              price: "₹100",
            },
            {
              img: "tipbox.png",
              brand: "Camlin Kokuyo",
              name: "0.7mm B Lead Tube",
              price: "₹20",
            },
          ].map((product, index) => {
            // Define inCart variable here for each product
            const inCart = isProductInCart(product);
            
            return (
              <div
                className="prohome"
                key={index}
                onClick={() => handleProductClick(product)}
              >
                <div className="product-img-containerhome">
                  <img className="product-imghome" src={product.img} alt={product.name} />
                  {inCart && <div className="in-cart-indicatorhome">In Cart</div>}
                </div>
                <div className="deshome">
                  <span className="brandhome">{product.brand}</span>
                  <h5 className="product-namehome">{product.name}</h5>
                  <div className="price-cart-containerhome">
                    <h4 className="pricehome">{product.price}</h4>
                    <button 
                      className={`cart-btnhome ${inCart ? 'in-carthome' : ''}`}
                      onClick={(e) => addToCart(e, product)}
                    >
                      <i className={`bx ${inCart ? 'bx-check' : 'bx-cart'} cart-iconhome`}></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="newsletter-sectionhome">
        <div className="newsletter-contenthome">
          <h3 className="newsletter-titlehome">Subscribe To Our Newsletter</h3>
          <p className="newsletter-texthome">Get updates on new products and special offers</p>
          <div className="newsletter-formhome">
            <input type="email" className="newsletter-inputhome" placeholder="Your email address" />
            <button className="subscribe-btnhome">Subscribe</button>
          </div>
        </div>
      </div>

      <footer className="section-p1home footerhome">
        <div className="footer-contenthome">
          <div className="colhome company-infohome">
            <h3 className="footer-titlehome">Jasa Essential</h3>
            <h4 className="footer-subtitlehome">Contact</h4>
            <p className="footer-texthome">
              <i className="bx bx-map footer-iconhome"></i>
              <strong className="footer-boldhome">Address:</strong> 562 Wellington Road, Street 32, San Francisco
            </p>
            <p className="footer-texthome">
              <i className="bx bx-phone footer-iconhome"></i>
              <strong className="footer-boldhome">Phone:</strong> +01 2222 345 / (+91) 0 123 456 789
            </p>
            <p className="footer-texthome">
              <i className="bx bx-time footer-iconhome"></i>
              <strong className="footer-boldhome">Hours:</strong> 10:00 - 18:00, Mon - Sat
            </p>
            <div className="followhome">
              <h4 className="footer-subtitlehome">Follow Us</h4>
              <div className="social-iconshome">
                <a href="#" className="social-linkhome"><i className="bx bxl-facebook social-iconhome"></i></a>
                <a href="#" className="social-linkhome"><i className="bx bxl-twitter social-iconhome"></i></a>
                <a href="#" className="social-linkhome"><i className="bx bxl-instagram social-iconhome"></i></a>
                <a href="#" className="social-linkhome"><i className="bx bxl-pinterest-alt social-iconhome"></i></a>
                <a href="#" className="social-linkhome"><i className="bx bxl-youtube social-iconhome"></i></a>
              </div>
            </div>
          </div>

          <div className="colhome">
            <h4 className="footer-subtitlehome">About</h4>
            <ul className="footer-listhome">
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">About us</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">Delivery Information</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">Privacy Policy</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">Terms & Conditions</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">Contact Us</a></li>
            </ul>
          </div>

          <div className="colhome">
            <h4 className="footer-subtitlehome">My Account</h4>
            <ul className="footer-listhome">
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">Sign In</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">View Cart</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">My Wishlist</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">Track My Order</a></li>
              <li className="footer-list-itemhome"><a href="#" className="footer-linkhome">Help</a></li>
            </ul>
          </div>
        </div>
        <div className="copyrighthome">
          <p className="copyright-texthome">© 2025 Jasa Essential - All Rights Reserved</p>
        </div>
      </footer>
    </>
  );
}

export default Home;