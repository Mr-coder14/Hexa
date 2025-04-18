import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { database, auth } from "./firebase"; // Make sure this path is correct
import { ref, push, set, onValue } from "firebase/database";
import "../css/ProductView.css";

// Image ID mapping - define this at the top of your file
const IMAGE_ID_MAPPING = {
  "2131230840": "about_us.png",
  "2131230841": "afoursheet.png",
  "2131230842": "athreenote.png",
  "2131230843": "athreenotee.jpg",
  "2131230844": "athreenotess.jpg",
  "2131230847": "back.png",
  "2131230848": "backround_btn_profile.png",
  "2131230849": "backroundblack_btn_profile.png",
  "2131230850": "backspalsh.png",
  "2131230851": "badge_background.png",
  "2131230852": "banner_bgprofile.png",
  "2131230853": "baseline_add_24.png",
  "2131230854": "baseline_arrow_back_24.png",
  "2131230855": "baseline_call_24.png",
  "2131230856": "baseline_delete_24.png",
  "2131230857": "baseline_edit_24.png",
  "2131230858": "baseline_email_24.png",
  "2131230859": "baseline_file_download_24.png",
  "2131230860": "baseline_file_upload_24.png",
  "2131230861": "baseline_history_24.png",
  "2131230862": "baseline_home_24.png",
  "2131230863": "baseline_info_24.png",
  "2131230864": "baseline_keyboard_backspace_24.png",
  "2131230865": "baseline_local_printshop_24.png",
  "2131230866": "baseline_location_on_24.png",
  "2131230867": "baseline_lock_reset_24.png",
  "2131230868": "baseline_logout_24.png",
  "2131230869": "baseline_menu_24.png",
  "2131230870": "baseline_menu_book_24.png",
  "2131230871": "baseline_minimize_24.png",
  "2131230872": "baseline_person_24.png",
  "2131230873": "baseline_person_add_alt_1_24.png",
  "2131230874": "baseline_preview_24.png",
  "2131230875": "baseline_privacy_tip_24.png",
  "2131230876": "baseline_remove_red_eye_24.png",
  "2131230877": "baseline_search_24.png",
  "2131230878": "baseline_settings_24.png",
  "2131230879": "baseline_shopping_cart_24.png",
  "2131230880": "baseline_smartphone_24.png",
  "2131230881": "bikelogo.png",
  "2131230882": "bipolar.jpg",
  "2131230883": "black_circle.png",
  "2131230884": "bookimg.png",
  "2131230885": "books.png",
  "2131230886": "borrderlines.png",
  "2131230887": "btn_1.png",
  "2131230888": "btn_3.png",
  "2131230889": "btn_4.png",
  "2131230898": "btnbackroundprofile.png",
  "2131230899": "button_background.png",
  "2131230900": "calculatordeli.png",
  "2131230901": "calculatorr.png",
  "2131230902": "caltrix.jpg",
  "2131230957": "casio991.jpg",
  "2131230958": "circles.png",
  "2131230978": "cx.png",
  "2131230979": "cxd.png",
  "2131230985": "drafte1.png",
  "2131230986": "drafter.png",
  "2131230987": "drafter1.jpg",
  "2131230988": "draftercombo.png",
  "2131230989": "edittext_background.png",
  "2131230990": "edittext_background_wh.png",
  "2131230991": "eraser.png",
  "2131230992": "file_paths.png",
  "2131230993": "files.jpg",
  "2131230994": "flair.jpg",
  "2131230997": "gradient_circle.png",
  "2131230998": "graph.png",
  "2131230999": "graphh.png",
  "2131231000": "graybackround.png",
  "2131231001": "greycircle.png",
  "2131231002": "header_back.png",
  "2131231003": "home_bg_green.png",
  "2131231004": "hotot.jpg",
  "2131231005": "htt.jpg",
  "2131231008": "ic_baseline_email_24.png",
  "2131231009": "ic_baseline_person_24.png",
  "2131231010": "ic_baseline_security_24.png",
  "2131231020": "ic_launcher_background.png",
  "2131231021": "ic_launcher_foreground.png",
  "2131231033": "iconwhapp.png",
  "2131231035": "instalogo.png",
  "2131231036": "jasalogo.png",
  "2131231037": "jasalogo512px.png",
  "2131231038": "labcourt.png",
  "2131231039": "laodingpng.png",
  "2131231040": "lavender_round.png",
  "2131231062": "minus.png",
  "2131231100": "nav_item_background.png",
  "2131231101": "nav_profile.png",
  "2131231102": "nav_share.png",
  "2131231104": "note.png",
  "2131231118": "onebyone.png",
  "2131231119": "onebytwo.png",
  "2131231120": "pdflogo.png",
  "2131231121": "pen.png",
  "2131231122": "pencilcombo.png",
  "2131231123": "pencombo.png",
  "2131231124": "person3.jpg",
  "2131231125": "phonelogo.png",
  "2131231126": "phonepay.png",
  "2131231127": "phto.jpg",
  "2131231128": "pngegg.png",
  "2131231130": "previeew_bg.png",
  "2131231131": "productbackround.png",
  "2131231132": "productimagee.png",
  "2131231133": "profile_bg_green.png",
  "2131231134": "qrcodesalem.jpg",
  "2131231135": "rapcode.png",
  "2131231136": "red_circle.png",
  "2131231137": "review.png",
  "2131231138": "scale.png",
  "2131231139": "search_icon.png",
  "2131231140": "smallnote.jpg",
  "2131231141": "social_btn_background.png",
  "2131231142": "stabler.jpg",
  "2131231143": "stylishblackpen.png",
  "2131231144": "stylishpenblue.jpg",
  "2131231146": "tick.png",
  "2131231147": "tipbox.png",
  "2131231148": "tippencil.png",
  "2131231151": "top_background.png",
  "2131231152": "uioop.png",
  "2131231153": "unknowenprofile.png",
  "2131231154": "upload.png",
  "2131231155": "upload2.png",
  "2131231156": "uploadqr.png",
  "2131231157": "vcc.jpg",
  "2131231158": "welcome.png",
  "2131231159": "white_box.png",
  "2131231160": "whitebg_profile.png",
  "2131231161": "whitebgcircleprofile.png",
  "2131231162": "whiteblack_bg.png",
  "2131231163": "women1.png",
  "2131231164": "xoblue.png",
  "2131231165": "xooblack.png"
};

function ProductView() {
    const location = useLocation();
    const product = location.state?.product;
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [showCartPreview, setShowCartPreview] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isInCart, setIsInCart] = useState(false);
    
    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            if (user) {
                // Fetch cart items
                const cartRef = ref(database, `userscart/${user.uid}`);
                onValue(cartRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const items = Object.values(data);
                        setCartItems(items);
                        setCartCount(items.length);
                        
                        // Check if current product is in cart
                        if (product) {
                            const productInCart = items.some(item => 
                                item.productname === product.name
                            );
                            setIsInCart(productInCart);
                        }
                    } else {
                        setCartItems([]);
                        setCartCount(0);
                        setIsInCart(false);
                    }
                });
            }
        });
        
        return () => unsubscribe();
    }, [product]);
    
    if (!product) {
      return (
        <div className="product-not-found section-p1">
          <h2>Product not found</h2>
          <button className="normal" onClick={() => navigate("/")}>Return to Shop</button>
        </div>
      );
    }

    const handleProductClick = (product) => {
        navigate("/product", { state: { product } });
    };
    
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };
    
    // Get image ID from filename
    const getImageIdFromPath = (imagePath) => {
        // Extract the filename from the path
        const parts = imagePath.split('/');
        const fileName = parts[parts.length - 1];
        
        // Find the ID that corresponds to this filename
        for (const [id, img] of Object.entries(IMAGE_ID_MAPPING)) {
            if (img === fileName) {
                return parseInt(id, 10);
            }
        }
        
        // Default ID if not found
        return 2131231165; // Default to xooblack.png
    };
    
    // Check if product is already in cart
    const checkIfProductInCart = (productToCheck) => {
        return cartItems.some(item => item.productname === productToCheck.name);
    };
    
    const addToCart = (productToAdd = product, productQty = quantity) => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        
        // Check if product is already in cart
        const productInCart = checkIfProductInCart(productToAdd);
        
        if (productInCart) {
            setToastMessage(`${productToAdd.name} is already in your cart!`);
            showNotification();
            return;
        }
        
        // Create a reference to the user's cart
        const cartRef = ref(database, `userscart/${currentUser.uid}`);
        const newItemRef = push(cartRef);
        
        // Prepare item data
        const itemData = {
            key: newItemRef.key,
            productname: productToAdd.name,
            productamt: productToAdd.price.replace('₹', ''), // Remove currency symbol
            productimage: getImageIdFromPath(productToAdd.img),
            qty: productQty,
            rating: 0,
            discription: productToAdd.description || `Brand: ${productToAdd.brand} Theme: Plain`
        };
        
        // Add to Firebase
        set(newItemRef, itemData)
            .then(() => {
                setToastMessage(`${productToAdd.name} added to cart!`);
                showNotification();
                setShowCartPreview(true); // Show cart preview
                setTimeout(() => setShowCartPreview(false), 5000); // Hide after 5 seconds
                setIsInCart(true); // Update state to reflect product is now in cart
            })
            .catch(error => {
                console.error("Error adding to cart:", error);
                alert("Failed to add item to cart. Please try again.");
            });
    };
    
    const showNotification = () => {
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };
    
    // Add featured product directly to cart
    const addFeaturedToCart = (e, featuredProduct) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if product is already in cart
        const productInCart = checkIfProductInCart(featuredProduct);
        
        if (productInCart) {
            setToastMessage(`${featuredProduct.name} is already in your cart!`);
            showNotification();
            return;
        }
        
        addToCart(featuredProduct, 1); // Add quantity 1 by default
    };
    
    // Function to get image paths with proper prefixes
    const getImagePath = (imgName) => {
        if (!imgName) return "";
        // If the path already includes http or / then return as is
        if (imgName.startsWith('http') || imgName.startsWith('/')) {
            return imgName;
        }
        // Otherwise, add the leading slash for public directory
        return `/${imgName}`;
    };

    // Navigate to cart page
    const goToCart = () => {
        navigate("/cart");
    };

    // Featured products data
    const featuredProducts = [
        { img: "xooblack.png", brand: "Hauser", name: "XO Ball Pen - Black Ink", price: "₹10" },
        { img: "xoblue.png", brand: "Hauser", name: "XO Ball Pen - Blue Ink", price: "₹10" },
        { img: "stylishpenblue.jpg", brand: "Stylish", name: "X3 Ball Pen - Blue (0.7mm)", price: "₹7" },
        { img: "stylishblackpen.png", brand: "Stylish", name: "X3 Ball Pen - Black (0.7mm)", price: "₹7" },
    ];

    return (
        <div>
            {/* Header with cart count */}
            <div className="product-header">
                <div className="cart-icon-container" onClick={goToCart}>
                    <i className="bx bx-cart"></i>
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </div>
            </div>
            
            {/* Toast notification */}
            <div className={`toast ${showToast ? 'show' : ''}`}>
                <i className={`bx ${toastMessage.includes('already') ? 'bx-info-circle' : 'bx-check-circle'}`}></i>
                <span>{toastMessage}</span>
            </div>
            
            {/* Cart Preview Overlay */}
            {showCartPreview && (
                <div className="cart-preview-overlay">
                    <div className="cart-preview">
                        <div className="cart-preview-header">
                            <h3>Cart Preview</h3>
                            <i className="bx bx-x" onClick={() => setShowCartPreview(false)}></i>
                        </div>
                        <div className="cart-preview-items">
                            {cartItems.slice(-3).map((item, index) => (
                                <div className="cart-preview-item" key={index}>
                                    <div className="cart-preview-img">
                                        <img 
                                            src={`/${IMAGE_ID_MAPPING[item.productimage]}`} 
                                            alt={item.productname}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/unknowenprofile.png";
                                            }}
                                        />
                                    </div>
                                    <div className="cart-preview-details">
                                        <h4>{item.productname}</h4>
                                        <p>₹{item.productamt} x {item.qty}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="cart-preview-footer">
                            <span>{cartItems.length} items in cart</span>
                            <button className="normal" onClick={goToCart}>View Cart</button>
                        </div>
                    </div>
                </div>
            )}
            
            <section id="prodetails" className="section-p1">
                <div className="single-pro-image">
                    <img 
                        src={getImagePath(product.img)} 
                        width="100%" 
                        id="MainImg" 
                        alt={product.name || "Product"} 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/unknowenprofile.png";
                        }}
                    />
                    <div className="small-img-group">
                        {[...Array(4)].map((_, index) => (
                            <div className="small-img-col" key={index}>
                                <img 
                                    src={getImagePath(product.img)} 
                                    width="100%" 
                                    className="small-img" 
                                    alt="Product thumbnail"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/unknowenprofile.png";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="single-pro-details">
                    <h6>Home / {product.brand || "Category"}</h6>
                    <h4>{product.name || "Product Name"}</h4>
                    <div className="price-container">
                        <h3>{product.price || "Price"}</h3>
                    </div>
                    
                    <div className="add-to-cart-container">
                        <div className="quantity-controls">
                            <button 
                                className="quantity-btn" 
                                onClick={() => setQuantity(prev => prev > 1 ? prev - 1 : 1)}
                                disabled={isInCart}
                            >-</button>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={handleQuantityChange} 
                                min="1"
                                disabled={isInCart}
                            />
                            <button 
                                className="quantity-btn" 
                                onClick={() => setQuantity(prev => prev + 1)}
                                disabled={isInCart}
                            >+</button>
                        </div>
                        {isInCart ? (
                            <button className="normal in-cart-btn" onClick={goToCart}>
                                <i className="bx bx-check"></i> Already in Cart - View Cart
                            </button>
                        ) : (
                            <button className="normal add-cart-btn" onClick={() => addToCart()}>
                                <i className="bx bx-cart-add"></i> Add To Cart
                            </button>
                        )}
                    </div>
                    
                    <div className="product-info">
                        <h4>Product Details</h4>
                        <span>{product.description || "No description available"}</span>
                    </div>
                    
                    <div className="product-features">
                        <div className="feature">
                            <i className="bx bx-check"></i>
                            <span>Quality Assurance</span>
                        </div>
                        <div className="feature">
                            <i className="bx bx-check"></i>
                            <span>Fast Delivery</span>
                        </div>
                        <div className="feature">
                            <i className="bx bx-check"></i>
                            <span>Easy Returns</span>
                        </div>
                    </div>
                </div>
            </section>
            
            <section id="product1" className="section-p1">
                <h2>Featured Products</h2>
                <p>Stationary Products</p>
                <div className="pro-container">
                    {featuredProducts.map((item, index) => {
                        const featuredProductInCart = checkIfProductInCart(item);
                        return (
                            <div className="pro" key={index} onClick={() => handleProductClick(item)}>
                                <img 
                                    className="shirt" 
                                    src={getImagePath(item.img)} 
                                    alt={item.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/unknowenprofile.png";
                                    }}
                                />
                                <div className="des">
                                    <span>{item.brand}</span>
                                    <h5>{item.name}</h5>
                                    <div className="price-tag">
                                        <h4>{item.price}</h4>
                                    </div>
                                </div>
                                {featuredProductInCart ? (
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setToastMessage(`${item.name} is already in your cart!`);
                                        showNotification();
                                    }}>
                                        <i className="bx bx-check cart-added"></i>
                                    </a>
                                ) : (
                                    <a href="#" onClick={(e) => addFeaturedToCart(e, item)}>
                                        <i className="bx bx-cart cart"></i>
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
            
            <footer className="section-p1">
                <div className="col">
                    <h3>Jasa Essential</h3>
                    <h4>Contact</h4>
                    <p><strong>Address:</strong> 562 Wellington Road, Street 32, San Francisco</p>
                    <p><strong>Phone:</strong> +01 2222 345 / (+91) 0 123 456 789</p>
                    <p><strong>Hours:</strong> 10:00 - 18:00, Mon - Sat</p>
                    <div className="follow">
                        <h4>Follow us</h4>
                        <div className="icon">
                            <i className="bx bxl-facebook"></i>
                            <i className="bx bxl-twitter"></i>
                            <i className="bx bxl-instagram"></i>
                            <i className="bx bxl-pinterest-alt"></i>
                            <i className="bx bxl-youtube"></i>
                        </div>
                    </div>
                </div>
                
                <div className="col">
                    <h4>About</h4>
                    <a href="#">About us</a>
                    <a href="#">Delivery Information</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms & Conditions</a>
                    <a href="#">Contact Us</a>
                </div>
                
                <div className="col">
                    <h4>My Account</h4>
                    <a href="#">Sign In</a>
                    <a href="#" onClick={goToCart}>View Cart</a>
                    <a href="#">My Wishlist</a>
                    <a href="#">Track My Order</a>
                    <a href="#">Help</a>
                </div>
            </footer>
        </div>
    );
}

export default ProductView;