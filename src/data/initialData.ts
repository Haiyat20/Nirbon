import { User, Product, Order, OrderStatusHistory } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    full_name: 'System Administrator',
    username: 'admin',
    password: 'admin123',
    mobile_number: '+1 555-0100',
    status: 'active',
    role: 'admin',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'user-emp-1',
    full_name: 'John Miller',
    username: 'john_emp',
    password: 'emp123',
    mobile_number: '+1 555-0144',
    status: 'active',
    role: 'employee',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'user-emp-2',
    full_name: 'Sarah Jenkins',
    username: 'sarah_emp',
    password: 'emp123',
    mobile_number: '+1 555-0188',
    status: 'active',
    role: 'employee',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'user-emp-3',
    full_name: 'Robert Chen',
    username: 'robert_emp',
    password: 'emp123',
    mobile_number: '+1 555-0199',
    status: 'inactive',
    role: 'employee',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-101',
    name: 'Monstera Deliciosa (Swiss Cheese)',
    photo_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
    price: 38.00,
    status: 'available',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prod-102',
    name: 'Fiddle Leaf Fig (Ficus Lyrata)',
    photo_url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    price: 52.50,
    status: 'available',
    created_at: new Date(Date.now() - 24 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prod-103',
    name: 'Snake Plant (Sansevieria Trifasciata)',
    photo_url: 'https://images.unsplash.com/photo-1599598425947-02064510b567?auto=format&fit=crop&w=600&q=80',
    price: 24.00,
    status: 'available',
    created_at: new Date(Date.now() - 23 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prod-104',
    name: 'Peace Lily (Spathiphyllum)',
    photo_url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=600&q=80',
    price: 29.99,
    status: 'available',
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prod-105',
    name: 'Golden Pothos (Devil\'s Ivy)',
    photo_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80',
    price: 18.50,
    status: 'available',
    created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prod-106',
    name: 'ZZ Plant (Zamioculcas Zamiifolia)',
    photo_url: 'https://images.unsplash.com/photo-1637967886160-bf78d6b38177?auto=format&fit=crop&w=600&q=80',
    price: 32.00,
    status: 'available',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prod-107',
    name: 'Calathea Orbifolia',
    photo_url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=600&q=80',
    price: 34.50,
    status: 'limited',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'prod-108',
    name: 'Rubber Tree (Ficus Elastica)',
    photo_url: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
    price: 45.00,
    status: 'available',
    created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
];

const now = new Date();
const todayISO = now.toISOString();

// Helper for dates relative to today
const getPastDateStr = (daysAgo: number, hoursAgo: number = 0) => {
  const d = new Date(now.getTime() - (daysAgo * 86400000 + hoursAgo * 3600000));
  return d.toISOString();
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-801',
    customer_id: 'CUST-3012',
    customer_name: 'Emily Davis',
    customer_mobile: '+1 555-8911',
    total_amount: 114.50,
    order_date: getPastDateStr(0, 2), // Today 2h ago
    status: 'Pending',
    items: [
      {
        id: 'item-1',
        order_id: 'ORD-801',
        product_id: 'prod-101',
        product_name: 'Monstera Deliciosa (Swiss Cheese)',
        product_photo: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
        price: 38.00,
        quantity: 2,
      },
      {
        id: 'item-2',
        order_id: 'ORD-801',
        product_id: 'prod-105',
        product_name: 'Golden Pothos (Devil\'s Ivy)',
        product_photo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80',
        price: 18.50,
        quantity: 2,
      }
    ],
    created_at: getPastDateStr(0, 2),
  },
  {
    id: 'ORD-802',
    customer_id: 'CUST-3045',
    customer_name: 'Michael Smith',
    customer_mobile: '+1 555-7732',
    total_amount: 76.50,
    order_date: getPastDateStr(0, 4), // Today 4h ago
    status: 'Approved',
    items: [
      {
        id: 'item-3',
        order_id: 'ORD-802',
        product_id: 'prod-102',
        product_name: 'Fiddle Leaf Fig (Ficus Lyrata)',
        product_photo: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
        price: 52.50,
        quantity: 1,
      },
      {
        id: 'item-4',
        order_id: 'ORD-802',
        product_id: 'prod-103',
        product_name: 'Snake Plant (Sansevieria Trifasciata)',
        product_photo: 'https://images.unsplash.com/photo-1599598425947-02064510b567?auto=format&fit=crop&w=600&q=80',
        price: 24.00,
        quantity: 1,
      }
    ],
    created_at: getPastDateStr(0, 4),
  },
  {
    id: 'ORD-803',
    customer_id: 'CUST-3088',
    customer_name: 'Sophia Martinez',
    customer_mobile: '+1 555-9021',
    total_amount: 64.00,
    order_date: getPastDateStr(1, 3), // Yesterday
    status: 'Approved',
    items: [
      {
        id: 'item-5',
        order_id: 'ORD-803',
        product_id: 'prod-106',
        product_name: 'ZZ Plant (Zamioculcas Zamiifolia)',
        product_photo: 'https://images.unsplash.com/photo-1637967886160-bf78d6b38177?auto=format&fit=crop&w=600&q=80',
        price: 32.00,
        quantity: 2,
      }
    ],
    created_at: getPastDateStr(1, 3),
  },
  {
    id: 'ORD-804',
    customer_id: 'CUST-3102',
    customer_name: 'David Taylor',
    customer_mobile: '+1 555-1104',
    total_amount: 89.99,
    order_date: getPastDateStr(2, 5), // 2 days ago
    status: 'Pending',
    items: [
      {
        id: 'item-6',
        order_id: 'ORD-804',
        product_id: 'prod-104',
        product_name: 'Peace Lily (Spathiphyllum)',
        product_photo: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=600&q=80',
        price: 29.99,
        quantity: 1,
      },
      {
        id: 'item-7',
        order_id: 'ORD-804',
        product_id: 'prod-108',
        product_name: 'Rubber Tree (Ficus Elastica)',
        product_photo: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
        price: 45.00,
        quantity: 1,
      }
    ],
    created_at: getPastDateStr(2, 5),
  },
  {
    id: 'ORD-805',
    customer_id: 'CUST-3150',
    customer_name: 'Jessica Wilson',
    customer_mobile: '+1 555-4431',
    total_amount: 103.50,
    order_date: getPastDateStr(10, 1), // 10 days ago (This Month)
    status: 'Approved',
    items: [
      {
        id: 'item-8',
        order_id: 'ORD-805',
        product_id: 'prod-107',
        product_name: 'Calathea Orbifolia',
        product_photo: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=600&q=80',
        price: 34.50,
        quantity: 3,
      }
    ],
    created_at: getPastDateStr(10, 1),
  }
];

export const INITIAL_ORDER_HISTORY: OrderStatusHistory[] = [
  {
    id: 'hist-1',
    order_id: 'ORD-802',
    previous_status: 'Pending',
    new_status: 'Approved',
    employee_name: 'John Miller',
    date: new Date(now.getTime() - 3 * 3600000).toISOString().split('T')[0],
    time: new Date(now.getTime() - 3 * 3600000).toTimeString().split(' ')[0],
    created_at: new Date(now.getTime() - 3 * 3600000).toISOString(),
  },
  {
    id: 'hist-2',
    order_id: 'ORD-803',
    previous_status: 'Pending',
    new_status: 'Approved',
    employee_name: 'Sarah Jenkins',
    date: new Date(now.getTime() - 20 * 3600000).toISOString().split('T')[0],
    time: new Date(now.getTime() - 20 * 3600000).toTimeString().split(' ')[0],
    created_at: new Date(now.getTime() - 20 * 3600000).toISOString(),
  },
  {
    id: 'hist-3',
    order_id: 'ORD-805',
    previous_status: 'Pending',
    new_status: 'Approved',
    employee_name: 'John Miller',
    date: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0],
    time: '11:20:00',
    created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
  }
];
