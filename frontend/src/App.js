import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { ShoppingCart, Package, BarChart3, Settings, Trash2, Phone, MessageSquare, Instagram, X, CheckCircle2, Clock, Eye, MousePointer, ShoppingBag, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [anonId, setAnonId] = useState("");
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [adminSettings, setAdminSettings] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("whatsapp");
  const [loading, setLoading] = useState({});

  useEffect(() => {
    initUser();
    loadProducts();
    
    // Remove any emergent badges that might be added dynamically
    const removeEmergentBadge = () => {
      const badges = document.querySelectorAll('a[href*="emergent"], [id*="emergent"], [class*="emergent"]');
      badges.forEach(badge => badge.remove());
    };
    
    // Run immediately and set interval
    removeEmergentBadge();
    const interval = setInterval(removeEmergentBadge, 500);
    
    return () => clearInterval(interval);
  }, []);

  const initUser = async () => {
    let id = localStorage.getItem("anon_id");
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("anon_id", id);
    }
    setAnonId(id);
    
    try {
      const { data } = await axios.get(`${API}/profile/${id}`);
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/products`);
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const trackEvent = async (type, payload) => {
    try {
      await axios.post(`${API}/events`, {
        anon_id: anonId,
        type,
        payload
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  const addToCart = async (product) => {
    setLoading(prev => ({ ...prev, [`add_${product.id}`]: true }));
    setCart([...cart, product]);
    await trackEvent("add_to_cart", product);
    toast.success(`${product.name} added to cart`);
    setLoading(prev => ({ ...prev, [`add_${product.id}`]: false }));
  };

  const removeFromCart = async (productId) => {
    setLoading(prev => ({ ...prev, [`remove_${productId}`]: true }));
    const product = cart.find(p => p.id === productId);
    setCart(cart.filter(p => p.id !== productId));
    await trackEvent("remove_from_cart", product);
    toast.info("Item removed from cart");
    setLoading(prev => ({ ...prev, [`remove_${productId}`]: false }));
  };

  const handleCheckout = async () => {
    setLoading(prev => ({ ...prev, checkout: true }));
    await trackEvent("checkout_started", { items: cart.length, total: cart.reduce((sum, p) => sum + p.price, 0) });
    toast.success("Checkout initiated!");
    setCart([]);
    setLoading(prev => ({ ...prev, checkout: false }));
  };

  const handleOptIn = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }
    setLoading(prev => ({ ...prev, optin: true }));
    try {
      const { data } = await axios.post(`${API}/profile`, {
        anon_id: anonId,
        phone_number: phoneNumber,
        opt_in: true,
        channel: selectedChannel
      });
      setProfile(data);
      setShowConsentModal(false);
      toast.success(`Opted in via ${selectedChannel.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to opt in");
    }
    setLoading(prev => ({ ...prev, optin: false }));
  };

  const handleRevokeConsent = async () => {
    setLoading(prev => ({ ...prev, revoke: true }));
    try {
      await axios.post(`${API}/profile`, {
        anon_id: anonId,
        opt_in: false
      });
      const { data } = await axios.get(`${API}/profile/${anonId}`);
      setProfile(data);
      toast.success("Consent revoked");
    } catch (error) {
      toast.error("Failed to revoke consent");
    }
    setLoading(prev => ({ ...prev, revoke: false }));
  };

  const handleDeleteData = async () => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await axios.delete(`${API}/profile/${anonId}`);
      setProfile(null);
      setCart([]);
      localStorage.removeItem("anon_id");
      toast.success("All data deleted");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("Failed to delete data");
    }
    setLoading(prev => ({ ...prev, delete: false }));
  };

  const triggerAbandonedCart = async () => {
    if (!profile?.opt_in) {
      toast.error("Please opt in first");
      return;
    }
    if (cart.length === 0) {
      toast.error("Add items to cart first");
      return;
    }
    
    setLoading(prev => ({ ...prev, trigger: true }));
    try {
      const { data } = await axios.post(`${API}/admin/trigger-abandoned/${anonId}`);
      if (data.success) {
        setShowMessagePreview({
          template: "abandoned_cart",
          channel: data.channel,
          message_id: data.message_id,
          product: cart[cart.length - 1]
        });
        toast.success("Abandoned cart message triggered!");
      } else {
        toast.error(data.error || "Failed to trigger");
      }
    } catch (error) {
      toast.error("Failed to trigger abandoned cart");
    }
    setLoading(prev => ({ ...prev, trigger: false }));
  };

  const sendMessage = async () => {
    setLoading(prev => ({ ...prev, send: true }));
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Message sent! Check dashboard for updates.");
    setShowMessagePreview(null);
    setLoading(prev => ({ ...prev, send: false }));
    loadAnalytics();
  };

  const loadAnalytics = async () => {
    try {
      const { data } = await axios.get(`${API}/analytics`);
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const loadLogs = async () => {
    try {
      const { data } = await axios.get(`${API}/analytics/logs`);
      setLogs(data);
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const loadAdminSettings = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/settings`);
      setAdminSettings(data);
    } catch (error) {
      console.error("Error loading admin settings:", error);
    }
  };

  const toggleChannel = async (channel) => {
    setLoading(prev => ({ ...prev, [channel]: true }));
    try {
      const update = {};
      update[`${channel}_active`] = !adminSettings[`${channel}_active`];
      await axios.post(`${API}/admin/settings`, update);
      await loadAdminSettings();
      toast.success(`${channel.toUpperCase()} ${!adminSettings[`${channel}_active`] ? 'activated' : 'paused'}`);
    } catch (error) {
      toast.error(`Failed to toggle ${channel}`);
    }
    setLoading(prev => ({ ...prev, [channel]: false }));
  };

  useEffect(() => {
    if (showDashboard) {
      loadAnalytics();
      loadLogs();
      const interval = setInterval(() => {
        loadAnalytics();
        loadLogs();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showDashboard]);

  useEffect(() => {
    if (showAdmin) {
      loadAdminSettings();
    }
  }, [showAdmin]);

  const getWhatsAppPreview = (product) => (
    <div className="whatsapp-preview" data-testid="whatsapp-preview">
      <div className="whatsapp-header">
        <div className="whatsapp-avatar"></div>
        <div>
          <div className="whatsapp-name">ShopFlow</div>
          <div className="whatsapp-status">Online</div>
        </div>
      </div>
      <div className="whatsapp-message">
        <div className="whatsapp-bubble">
          <img src={product.image_url} alt={product.name} className="whatsapp-image" />
          <div className="whatsapp-text">
            <strong>Don't forget your cart! 🛒</strong>
            <p>{product.name}</p>
            <p className="whatsapp-price">${product.price}</p>
            <p>Complete your purchase now and get 10% off!</p>
          </div>
          <a href={`/?utm_message_id=${showMessagePreview?.message_id}`} target="_blank" rel="noopener noreferrer" className="whatsapp-cta" data-testid="message-cta-link">
            Shop Now
          </a>
          <div className="whatsapp-buttons">
            <button className="whatsapp-button" data-testid="whatsapp-view-cart-btn">View Cart</button>
            <button className="whatsapp-button" data-testid="whatsapp-checkout-btn">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );

  const getSMSPreview = (product) => (
    <div className="sms-preview" data-testid="sms-preview">
      <div className="sms-header">SMS Message</div>
      <div className="sms-bubble">
        <p>Hi! You left {product.name} (${product.price}) in your cart.</p>
        <p>Complete your order now & get 10% OFF!</p>
        <p>Shop: {window.location.origin}?utm_message_id={showMessagePreview?.message_id}</p>
        <p className="sms-footer">Reply STOP to opt out</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="app-header" data-testid="app-header">
        <div className="header-content">
          <div className="logo-section">
            <Package className="logo-icon" />
            <h1 className="logo-text">ShopFlow</h1>
            <Badge variant="outline" className="demo-badge">DEMO</Badge>
          </div>
          
          <div className="header-actions">
            <Button variant="ghost" size="sm" onClick={() => setShowConsentModal(true)} data-testid="profile-btn">
              <Phone className="h-4 w-4 mr-2" />
              {profile?.opt_in ? "Profile" : "Opt In"}
              {profile?.opt_in && <Badge className="ml-2" variant="success">✓</Badge>}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => { setShowDashboard(true); }} data-testid="dashboard-btn">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => { setShowAdmin(true); }} data-testid="admin-btn">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
            
            <Button variant="outline" size="sm" className="cart-button" data-testid="cart-btn">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({cart.length})
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Smart Business Messaging</h2>
          <p className="hero-subtitle">WhatsApp-first messaging with SMS fallback • Real-time analytics • Privacy-focused</p>
          <div className="hero-features">
            <Badge variant="secondary">Abandoned Cart Recovery</Badge>
            <Badge variant="secondary">Multi-Channel</Badge>
            <Badge variant="secondary">GDPR Compliant</Badge>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="section-header">
          <h3 className="section-title">Featured Products</h3>
          <p className="section-subtitle">{products.length} products available</p>
        </div>
        
        <div className="products-grid" data-testid="products-grid">
          {products.map(product => (
            <Card key={product.id} className="product-card" data-testid={`product-card-${product.id}`}>
              <div className="product-image-wrapper">
                <img src={product.image_url} alt={product.name} className="product-image" />
                <Badge className="product-badge">{product.category}</Badge>
              </div>
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-price">${product.price}</p>
                <p className="product-stock">{product.stock} in stock</p>
                <div className="product-actions">
                  <Button 
                    size="sm" 
                    onClick={() => addToCart(product)} 
                    disabled={loading[`add_${product.id}`]}
                    data-testid={`add-to-cart-${product.id}`}
                    className="btn-add-cart"
                  >
                    {loading[`add_${product.id}`] ? "Adding..." : "Add to Cart"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedProduct(product)}
                    data-testid={`view-product-${product.id}`}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Cart Section */}
      {cart.length > 0 && (
        <section className="cart-section" data-testid="cart-section">
          <Card className="cart-card">
            <div className="cart-header">
              <h3 className="cart-title">
                <ShoppingCart className="h-5 w-5" />
                Your Cart ({cart.length} items)
              </h3>
              <p className="cart-total">Total: ${cart.reduce((sum, p) => sum + p.price, 0).toFixed(2)}</p>
            </div>
            
            <div className="cart-items">
              {cart.map((item, idx) => (
                <div key={idx} className="cart-item" data-testid={`cart-item-${idx}`}>
                  <img src={item.image_url} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">${item.price}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeFromCart(item.id)}
                    disabled={loading[`remove_${item.id}`]}
                    data-testid={`remove-from-cart-${idx}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="cart-actions">
              <Button onClick={handleCheckout} disabled={loading.checkout} data-testid="checkout-btn">
                {loading.checkout ? "Processing..." : "Checkout"}
              </Button>
              <Button 
                variant="outline" 
                onClick={triggerAbandonedCart} 
                disabled={loading.trigger}
                data-testid="trigger-abandoned-btn"
              >
                {loading.trigger ? "Triggering..." : "🎯 Trigger Abandoned (Demo)"}
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* Consent Modal */}
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="consent-modal" data-testid="consent-modal">
          <DialogHeader>
            <DialogTitle>Messaging Preferences</DialogTitle>
            <DialogDescription>
              Opt in to receive cart reminders and special offers
            </DialogDescription>
          </DialogHeader>
          
          {profile?.opt_in ? (
            <div className="profile-info" data-testid="profile-info">
              <div className="profile-field">
                <label>User ID</label>
                <code>{anonId}</code>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <code>{profile.masked_phone || "Not set"}</code>
              </div>
              <div className="profile-field">
                <label>Channel</label>
                <Badge>{profile.channel?.toUpperCase()}</Badge>
              </div>
              <div className="profile-field">
                <label>Status</label>
                <Badge variant="success">Opted In ✓</Badge>
              </div>
              
              <div className="profile-actions">
                <Button variant="destructive" onClick={handleRevokeConsent} disabled={loading.revoke} data-testid="revoke-consent-btn">
                  {loading.revoke ? "Revoking..." : "Revoke Consent"}
                </Button>
                <Button variant="outline" onClick={handleDeleteData} disabled={loading.delete} data-testid="delete-data-btn">
                  {loading.delete ? "Deleting..." : "Delete All Data"}
                </Button>
              </div>
              
              <p className="privacy-note">
                🔒 We store only masked contact details. Consent can be revoked anytime.
              </p>
            </div>
          ) : (
            <div className="opt-in-form" data-testid="opt-in-form">
              <Input 
                type="tel" 
                placeholder="+1 234 567 8900" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                data-testid="phone-input"
              />
              
              <div className="channel-selector">
                <label>Choose your channel:</label>
                <div className="channel-options">
                  <Button 
                    variant={selectedChannel === "whatsapp" ? "default" : "outline"}
                    onClick={() => setSelectedChannel("whatsapp")}
                    data-testid="channel-whatsapp"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    variant={selectedChannel === "sms" ? "default" : "outline"}
                    onClick={() => setSelectedChannel("sms")}
                    data-testid="channel-sms"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button 
                    variant={selectedChannel === "instagram" ? "default" : "outline"}
                    onClick={() => setSelectedChannel("instagram")}
                    data-testid="channel-instagram"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                </div>
              </div>
              
              <Button onClick={handleOptIn} disabled={loading.optin} data-testid="opt-in-submit-btn">
                {loading.optin ? "Opting In..." : "Opt In"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Preview Modal */}
      <Dialog open={!!showMessagePreview} onOpenChange={() => setShowMessagePreview(null)}>
        <DialogContent className="preview-modal" data-testid="message-preview-modal">
          <DialogHeader>
            <DialogTitle>Message Preview</DialogTitle>
            <DialogDescription>
              {showMessagePreview?.channel === "whatsapp" ? "WhatsApp" : "SMS"} • {showMessagePreview?.template.replace("_", " ").toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          
          {showMessagePreview && (
            <div className="preview-content">
              <Tabs defaultValue={showMessagePreview.channel}>
                <TabsList>
                  <TabsTrigger value="whatsapp" data-testid="preview-tab-whatsapp">WhatsApp</TabsTrigger>
                  <TabsTrigger value="sms" data-testid="preview-tab-sms">SMS</TabsTrigger>
                </TabsList>
                <TabsContent value="whatsapp">
                  {getWhatsAppPreview(showMessagePreview.product)}
                </TabsContent>
                <TabsContent value="sms">
                  {getSMSPreview(showMessagePreview.product)}
                </TabsContent>
              </Tabs>
              
              <div className="preview-actions">
                <Button onClick={sendMessage} disabled={loading.send} data-testid="send-message-btn">
                  {loading.send ? "Sending..." : "Send (Simulate)"}
                </Button>
                <Button variant="outline" onClick={() => setShowMessagePreview(null)} data-testid="close-preview-btn">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Panel */}
      <Dialog open={showAdmin} onOpenChange={setShowAdmin}>
        <DialogContent className="admin-modal" data-testid="admin-panel">
          <DialogHeader>
            <DialogTitle>Admin Controls</DialogTitle>
            <DialogDescription>Manage channels and trigger test messages</DialogDescription>
          </DialogHeader>
          
          {adminSettings && (
            <div className="admin-content">
              <div className="channel-controls">
                <h4>Channel Status</h4>
                
                <div className="channel-control-item" data-testid="admin-whatsapp-control">
                  <div className="channel-info">
                    <MessageSquare className="h-5 w-5" />
                    <span>WhatsApp</span>
                    <Badge variant={adminSettings.whatsapp_active ? "success" : "secondary"}>
                      {adminSettings.whatsapp_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <Switch 
                    checked={adminSettings.whatsapp_active}
                    onCheckedChange={() => toggleChannel("whatsapp")}
                    disabled={loading.whatsapp}
                    data-testid="toggle-whatsapp"
                  />
                </div>
                
                <div className="channel-control-item" data-testid="admin-sms-control">
                  <div className="channel-info">
                    <Phone className="h-5 w-5" />
                    <span>SMS</span>
                    <Badge variant={adminSettings.sms_active ? "success" : "secondary"}>
                      {adminSettings.sms_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <Switch 
                    checked={adminSettings.sms_active}
                    onCheckedChange={() => toggleChannel("sms")}
                    disabled={loading.sms}
                    data-testid="toggle-sms"
                  />
                </div>
                
                <div className="channel-control-item" data-testid="admin-instagram-control">
                  <div className="channel-info">
                    <Instagram className="h-5 w-5" />
                    <span>Instagram</span>
                    <Badge variant={adminSettings.instagram_active ? "success" : "secondary"}>
                      {adminSettings.instagram_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <Switch 
                    checked={adminSettings.instagram_active}
                    onCheckedChange={() => toggleChannel("instagram")}
                    disabled={loading.instagram}
                    data-testid="toggle-instagram"
                  />
                </div>
              </div>
              
              <div className="admin-actions">
                <Button onClick={triggerAbandonedCart} disabled={loading.trigger} data-testid="admin-trigger-btn">
                  {loading.trigger ? "Triggering..." : "Trigger Test Message"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dashboard */}
      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="dashboard-modal" data-testid="dashboard-panel">
          <DialogHeader>
            <DialogTitle>Analytics Dashboard</DialogTitle>
            <DialogDescription>Real-time messaging metrics and logs</DialogDescription>
          </DialogHeader>
          
          {analytics && (
            <div className="dashboard-content">
              <div className="metrics-grid">
                <div className="metric-card" data-testid="metric-sent">
                  <Clock className="metric-icon" />
                  <div className="metric-value">{analytics.sent}</div>
                  <div className="metric-label">Sent</div>
                </div>
                
                <div className="metric-card" data-testid="metric-delivered">
                  <CheckCircle2 className="metric-icon" />
                  <div className="metric-value">{analytics.delivered}</div>
                  <div className="metric-label">Delivered</div>
                </div>
                
                <div className="metric-card" data-testid="metric-read">
                  <Eye className="metric-icon" />
                  <div className="metric-value">{analytics.read}</div>
                  <div className="metric-label">Read</div>
                </div>
                
                <div className="metric-card" data-testid="metric-clicks">
                  <MousePointer className="metric-icon" />
                  <div className="metric-value">{analytics.clicks}</div>
                  <div className="metric-label">Clicks</div>
                </div>
                
                <div className="metric-card" data-testid="metric-conversions">
                  <ShoppingBag className="metric-icon" />
                  <div className="metric-value">{analytics.conversions}</div>
                  <div className="metric-label">Conversions</div>
                </div>
                
                <div className="metric-card" data-testid="metric-optouts">
                  <UserX className="metric-icon" />
                  <div className="metric-value">{analytics.opt_outs}</div>
                  <div className="metric-label">Opt-outs</div>
                </div>
              </div>
              
              <div className="logs-section">
                <h4>Activity Logs</h4>
                <div className="logs-list" data-testid="activity-logs">
                  {logs.slice(0, 10).map((log, idx) => (
                    <div key={idx} className="log-item" data-testid={`log-item-${idx}`}>
                      <Badge variant="outline">{log.type}</Badge>
                      <span className="log-description">{log.description}</span>
                      <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent data-testid="product-detail-modal">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>{selectedProduct?.category}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="product-detail">
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="product-detail-image" />
              <p className="product-detail-price">${selectedProduct.price}</p>
              <p className="product-detail-stock">{selectedProduct.stock} units available</p>
              <Button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} data-testid="product-detail-add-btn">
                Add to Cart
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;