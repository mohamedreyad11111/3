import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// إعداد CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// محاكاة قاعدة بيانات في الذاكرة (يمكنك استبدالها بـ Firebase لاحقاً)
const users = new Map();

// نقطة نهاية تسجيل الدخول
app.post('/api/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // التحقق من المدخلات
    if (!email || !password) {
      return c.json({ 
        success: false, 
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
      }, 400);
    }
    
    // البحث عن المستخدم
    const user = users.get(email);
    
    if (!user || user.password !== password) {
      return c.json({ 
        success: false, 
        message: 'بيانات الدخول غير صحيحة' 
      }, 401);
    }
    
    // إنشاء رمز مميز بسيط
    const token = btoa(`${email}:${Date.now()}`);
    
    return c.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          email: user.email,
          name: user.name
        },
        token: token
      }
    });
    
  } catch (error) {
    return c.json({ 
      success: false, 
      message: 'حدث خطأ في السيرفر' 
    }, 500);
  }
});

// نقطة نهاية التسجيل
app.post('/api/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    // التحقق من المدخلات
    if (!email || !password || !name) {
      return c.json({ 
        success: false, 
        message: 'جميع الحقول مطلوبة' 
      }, 400);
    }
    
    // التحقق من وجود المستخدم
    if (users.has(email)) {
      return c.json({ 
        success: false, 
        message: 'البريد الإلكتروني مستخدم بالفعل' 
      }, 409);
    }
    
    // إنشاء مستخدم جديد
    const newUser = {
      email,
      password,
      name,
      createdAt: new Date().toISOString()
    };
    
    users.set(email, newUser);
    
    // إنشاء رمز مميز
    const token = btoa(`${email}:${Date.now()}`);
    
    return c.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        user: {
          email: newUser.email,
          name: newUser.name
        },
        token: token
      }
    });
    
  } catch (error) {
    return c.json({ 
      success: false, 
      message: 'حدث خطأ في السيرفر' 
    }, 500);
  }
});

// نقطة نهاية للتحقق من الصحة
app.get('/api/health', (c) => {
  return c.json({ 
    success: true, 
    message: 'السيرفر يعمل بشكل جيد' 
  });
});

// نقطة نهاية الجذر
app.get('/', (c) => {
  return c.text('مرحباً! هذا سيرفر Hono.js للمصادقة');
});

export default app;