from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import asyncio
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    price: float
    image_url: str
    stock: int
    category: str

class Profile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    anon_id: str
    phone_number: Optional[str] = None
    phone_hash: Optional[str] = None
    masked_phone: Optional[str] = None
    opt_in: bool = False
    channel: Optional[str] = None  # whatsapp, sms, instagram
    created_at: str

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    anon_id: str
    type: str  # add_to_cart, view, checkout_started, support_message
    payload: Dict[str, Any]
    timestamp: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    anon_id: str
    template: str
    channel: str
    status: str  # queued, sent, delivered, read, clicked, failed
    product_info: Optional[Dict[str, Any]] = None
    created_at: str
    delivered_at: Optional[str] = None
    read_at: Optional[str] = None
    clicked_at: Optional[str] = None

class Analytics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    sent: int = 0
    delivered: int = 0
    read: int = 0
    clicks: int = 0
    conversions: int = 0
    opt_outs: int = 0

class AdminSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    whatsapp_active: bool = True
    sms_active: bool = True
    instagram_active: bool = True

# In-memory settings (in production, use database)
admin_settings = AdminSettings()

# Helper functions
def mask_phone(phone: str) -> str:
    if not phone or len(phone) < 4:
        return phone
    return f"{phone[:3]} •••• {phone[-4:]}"

def hash_phone(phone: str) -> str:
    return hashlib.sha256(phone.encode()).hexdigest()

# Products API
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    if not products:
        # Initialize sample products
        sample_products = [
            {"id": str(uuid.uuid4()), "name": "Wireless Headphones", "price": 79.99, "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "stock": 45, "category": "Electronics"},
            {"id": str(uuid.uuid4()), "name": "Smart Watch", "price": 199.99, "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "stock": 32, "category": "Electronics"},
            {"id": str(uuid.uuid4()), "name": "Laptop Backpack", "price": 49.99, "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "stock": 67, "category": "Accessories"},
            {"id": str(uuid.uuid4()), "name": "USB-C Hub", "price": 34.99, "image_url": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400", "stock": 89, "category": "Electronics"},
            {"id": str(uuid.uuid4()), "name": "Desk Lamp", "price": 29.99, "image_url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", "stock": 54, "category": "Home"},
            {"id": str(uuid.uuid4()), "name": "Bluetooth Speaker", "price": 59.99, "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", "stock": 41, "category": "Electronics"},
            {"id": str(uuid.uuid4()), "name": "Phone Stand", "price": 19.99, "image_url": "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400", "stock": 76, "category": "Accessories"},
            {"id": str(uuid.uuid4()), "name": "Wireless Mouse", "price": 24.99, "image_url": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400", "stock": 93, "category": "Electronics"},
            {"id": str(uuid.uuid4()), "name": "Notebook Set", "price": 14.99, "image_url": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400", "stock": 128, "category": "Stationery"},
            {"id": str(uuid.uuid4()), "name": "Water Bottle", "price": 22.99, "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", "stock": 85, "category": "Lifestyle"},
            {"id": str(uuid.uuid4()), "name": "Yoga Mat", "price": 39.99, "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400", "stock": 47, "category": "Fitness"},
            {"id": str(uuid.uuid4()), "name": "Coffee Mug", "price": 12.99, "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400", "stock": 112, "category": "Home"},
        ]
        await db.products.insert_many(sample_products)
        products = sample_products
    return products

# Profile API
class ProfileRequest(BaseModel):
    anon_id: str
    phone_number: Optional[str] = None
    opt_in: Optional[bool] = None
    channel: Optional[str] = None

@api_router.post("/profile")
async def update_profile(request: ProfileRequest):
    profile_data = {"anon_id": request.anon_id}
    
    existing = await db.profiles.find_one({"anon_id": request.anon_id}, {"_id": 0})
    
    if request.phone_number:
        profile_data["phone_number"] = request.phone_number
        profile_data["phone_hash"] = hash_phone(request.phone_number)
        profile_data["masked_phone"] = mask_phone(request.phone_number)
    
    if request.opt_in is not None:
        profile_data["opt_in"] = request.opt_in
    
    if request.channel:
        profile_data["channel"] = request.channel
    
    if not existing:
        profile_data["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.profiles.insert_one(profile_data)
    else:
        await db.profiles.update_one(
            {"anon_id": request.anon_id},
            {"$set": profile_data}
        )
    
    return await db.profiles.find_one({"anon_id": request.anon_id}, {"_id": 0})

@api_router.get("/profile/{anon_id}")
async def get_profile(anon_id: str):
    profile = await db.profiles.find_one({"anon_id": anon_id}, {"_id": 0})
    if not profile:
        # Create new profile
        profile = {
            "anon_id": anon_id,
            "opt_in": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.profiles.insert_one(profile)
    return profile

@api_router.delete("/profile/{anon_id}")
async def delete_profile(anon_id: str):
    await db.profiles.delete_one({"anon_id": anon_id})
    await db.events.delete_many({"anon_id": anon_id})
    await db.messages.delete_many({"anon_id": anon_id})
    return {"success": True, "message": "All data deleted"}

# Events API
class EventRequest(BaseModel):
    anon_id: str
    type: str
    payload: Dict[str, Any]

@api_router.post("/events")
async def create_event(request: EventRequest):
    event_data = {
        "id": str(uuid.uuid4()),
        "anon_id": request.anon_id,
        "type": request.type,
        "payload": request.payload,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event_data)
    return {"success": True, "event_id": event_data["id"]}

@api_router.get("/events/{anon_id}")
async def get_events(anon_id: str):
    events = await db.events.find({"anon_id": anon_id}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return events

# Messages API
class MessageRequest(BaseModel):
    anon_id: str
    template: str  # abandoned_cart, price_drop, support
    product_info: Optional[Dict[str, Any]] = None
    force_channel: Optional[str] = None

@api_router.post("/messages/send")
async def send_message(request: MessageRequest):
    profile = await db.profiles.find_one({"anon_id": request.anon_id}, {"_id": 0})
    
    if not profile or not profile.get("opt_in"):
        return {"success": False, "error": "User not opted in or profile not found"}
    
    # Determine channel
    channel = request.force_channel or profile.get("channel", "whatsapp")
    
    # Check if channel is active
    if channel == "whatsapp" and not admin_settings.whatsapp_active:
        # Fallback to SMS
        channel = "sms"
    elif channel == "sms" and not admin_settings.sms_active:
        return {"success": False, "error": "No active channels available"}
    
    message_id = str(uuid.uuid4())
    message_data = {
        "id": message_id,
        "anon_id": request.anon_id,
        "template": request.template,
        "channel": channel,
        "status": "sent",
        "product_info": request.product_info,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_data)
    
    # Simulate webhook events
    asyncio.create_task(simulate_webhooks(message_id))
    
    return {"success": True, "message_id": message_id, "channel": channel}

async def simulate_webhooks(message_id: str):
    """Simulate delivered -> read -> click events"""
    await asyncio.sleep(1)
    await db.messages.update_one(
        {"id": message_id},
        {"$set": {"status": "delivered", "delivered_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await asyncio.sleep(2)
    await db.messages.update_one(
        {"id": message_id},
        {"$set": {"status": "read", "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # 70% chance of click
    if random.random() < 0.7:
        await asyncio.sleep(3)
        await db.messages.update_one(
            {"id": message_id},
            {"$set": {"status": "clicked", "clicked_at": datetime.now(timezone.utc).isoformat()}}
        )

@api_router.get("/messages/{anon_id}")
async def get_messages(anon_id: str):
    messages = await db.messages.find({"anon_id": anon_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

@api_router.post("/messages/{message_id}/convert")
async def track_conversion(message_id: str):
    message = await db.messages.find_one({"id": message_id})
    if message:
        await db.messages.update_one(
            {"id": message_id},
            {"$set": {"converted": True, "converted_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True}
    return {"success": False}

# Analytics API
@api_router.get("/analytics")
async def get_analytics():
    messages = await db.messages.find({}, {"_id": 0}).to_list(10000)
    
    analytics = {
        "sent": len(messages),
        "delivered": len([m for m in messages if m.get("status") in ["delivered", "read", "clicked"]]),
        "read": len([m for m in messages if m.get("status") in ["read", "clicked"]]),
        "clicks": len([m for m in messages if m.get("status") == "clicked"]),
        "conversions": len([m for m in messages if m.get("converted")]),
        "opt_outs": await db.profiles.count_documents({"opt_in": False})
    }
    
    return analytics

@api_router.get("/analytics/logs")
async def get_logs():
    events = await db.events.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
    messages = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    
    logs = []
    for event in events:
        logs.append({
            "type": "event",
            "timestamp": event["timestamp"],
            "description": f"Event: {event['type']}",
            "data": event
        })
    
    for message in messages:
        logs.append({
            "type": "message",
            "timestamp": message["created_at"],
            "description": f"Message {message['status']}: {message['template']} via {message['channel']}",
            "data": message
        })
    
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs[:50]

# Admin API
@api_router.get("/admin/settings")
async def get_admin_settings():
    return admin_settings.model_dump()

class AdminSettingsUpdate(BaseModel):
    whatsapp_active: Optional[bool] = None
    sms_active: Optional[bool] = None
    instagram_active: Optional[bool] = None

@api_router.post("/admin/settings")
async def update_admin_settings(settings: AdminSettingsUpdate):
    if settings.whatsapp_active is not None:
        admin_settings.whatsapp_active = settings.whatsapp_active
    if settings.sms_active is not None:
        admin_settings.sms_active = settings.sms_active
    if settings.instagram_active is not None:
        admin_settings.instagram_active = settings.instagram_active
    
    return admin_settings.model_dump()

@api_router.post("/admin/trigger-abandoned/{anon_id}")
async def trigger_abandoned_cart(anon_id: str):
    # Get user's cart items from events
    cart_events = await db.events.find({
        "anon_id": anon_id,
        "type": "add_to_cart"
    }, {"_id": 0}).to_list(100)
    
    if not cart_events:
        return {"success": False, "error": "No cart items found"}
    
    last_product = cart_events[-1]["payload"]
    
    request = MessageRequest(
        anon_id=anon_id,
        template="abandoned_cart",
        product_info=last_product
    )
    
    return await send_message(request)

@api_router.get("/")
async def root():
    return {"message": "Smart Business Messaging API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()