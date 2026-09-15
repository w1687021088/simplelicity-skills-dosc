# class

复习

方法

## public-公开

公开的（默认）**谁都能访问，内部、子类、外部都可以。**

```typescript
class Animal {
  public name: string;  // 不写 public 也默认是 public
  
  constructor(name: string) {
    this.name = name;
  }
  
  public speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  bark() {
    console.log(this.name);  // ✅ 子类能访问
  }
}

const dog = new Dog('旺财');
console.log(dog.name);  // ✅ 外部能访问
dog.speak();            // ✅ 外部能调用
```

**使用场景**：对外提供的 API 方法、公开属性（如 DTO、实体 ID）

**注意事项**：

- 可以省略不写（默认就是 `public`）
- 构造函数参数简写时必须写（`constructor(public name: string)`）
- 公开方法应该稳定，不要随意修改



## private-私有

**只有本类内部能访问，子类和外部都不行。**

```typescript
class BankAccount {
  private balance: number = 0;
  
  constructor(initial: number) {
    this.balance = initial;  // ✅ 内部能访问
  }
  
  deposit(amount: number) {
    this.balance += amount;  // ✅ 内部能访问
  }
  
  getBalance() {
    return this.balance;    // ✅ 内部能访问
  }
}

class ChildAccount extends BankAccount {
  tryAccess() {
    // console.log(this.balance);  // ❌ 报错：子类访问不到
  }
}

const account = new BankAccount(100);
// console.log(account.balance);  // ❌ 报错：外部访问不到
console.log(account.getBalance());  // ✅ 通过公开方法间接访问
```

**使用场景**：内部状态（如密码、缓存、依赖注入）、辅助方法（如验证、加密）

**注意事项**：

- TypeScript 的 `private` 只在编译期检查，编译后 JS 可以访问（运行时无保护）
- 如需运行时私有，用 ES2022 的 `#` 私有字段
- 命名约定：通常用 `_` 前缀（如 `_password`）
- **子类不能继承 private 成员**



## readonly-只读

**赋值后不能再修改（可配合其他修饰符使用）。**

```typescript
class User {
  // 声明时赋值
  public readonly id: string = 'user-001';
  
  // 构造函数中赋值
  public readonly createdAt: Date;
  private readonly _secret: string;
  protected readonly _config: any;
  public static readonly VERSION = '1.0.0';  // 静态只读
  
  constructor(name: string, secret: string) {
    this.createdAt = new Date();   // ✅ 构造函数中赋值
    this._secret = secret;         // ✅ 构造函数中赋值
  }
  
  updateSecret(newSecret: string) {
    // this._secret = newSecret;  // ❌ 报错：不能修改
    // this.createdAt = new Date();  // ❌ 报错：不能修改
  }
}

const user = new User('张三', 'abc123');
console.log(user.id);           // ✅ 读取
// user.id = 'new-id';          // ❌ 不能修改
console.log(User.VERSION);      // ✅ 读取
// User.VERSION = '2.0.0';      // ❌ 不能修改

// readonly 数组内容可以修改，但引用不能改
class Test {
  readonly list: string[] = ['a', 'b'];
  
  test() {
    this.list.push('c');   // ✅ 可以修改内容
    // this.list = ['x'];  // ❌ 不能重新赋值
  }
}
```



**使用场景**：

- 依赖注入（`private readonly`）
- 公开常量（`public static readonly`）
- 实体 ID、创建时间（`public readonly`）
- 内部密钥（`private static readonly`）

**注意事项**：

- `readonly` 是浅层的，数组/对象的内容可以修改（引用不可变）
- 深度只读需要 `ReadonlyArray` 或 `as const`
- `static readonly` 必须在声明时赋值（不能在构造函数中）
- 与 `private` 组合最常用（`private readonly`）



## protected - 受保护

**本类内部和子类内部能访问，外部不行。**

```typescript
class Vehicle {
  protected engine: string = 'V8';
  private secretCode: string = '123';  // 对比：private
  
  constructor(public brand: string) {}
  
  start() {
    console.log(this.engine);  // ✅ 内部能访问
    console.log(this.secretCode);  // ✅ 内部能访问
  }
}

class Car extends Vehicle {
  constructor(brand: string) {
    super(brand);
  }
  
  revEngine() {
    console.log(this.engine);  // ✅ 子类能访问 protected
    // console.log(this.secretCode);  // ❌ 子类访问不到 private
  }
}

const car = new Car('Toyota');
// console.log(car.engine);  // ❌ 外部访问不到 protected
console.log(car.brand);      // ✅ 外部访问 public
car.start();                 // ✅ 外部调用 public 方法
```



**使用场景**：

- 基类核心逻辑（被子类继承和重写）
- 钩子方法（模板方法模式）
- 抽象类的实现细节

**注意事项**：

- `protected` 比 `private` 宽松，给子类留扩展空间

- 命名约定：通常也用 `_` 前缀（与 private 相同）

- 如果不打算被继承，用 `private` 更严格

- `protected constructor()` 可以阻止外部 new，但允许继承

  

## static-静态

**属于类本身，不属于实例，所有实例共享同一个。**

```typescript
class UserService {
  // 1. 静态属性：属于类，所有实例共享
  public static totalUsers = 0;
  
  // 2. 私有静态属性：内部使用
  private static _instance: UserService;
  
  // 3. 静态只读常量
  public static readonly VERSION = '1.0.0';
  private static readonly SECRET_KEY = 'abc123';
  
  // 4. 实例属性：每个实例独立
  public name: string;
  
  constructor(name: string) {
    this.name = name;
    UserService.totalUsers++;  // 每 new 一个，总数 +1
  }
  
  // 5. 静态方法：类名调用
  public static getTotalUsers(): number {
    return UserService.totalUsers;
  }
  
  // 6. 私有静态方法：内部辅助
  private static _validateConfig(config: any): boolean {
    return config && config.host;
  }
  
  // 7. 单例模式：经典用法
  public static getInstance(): UserService {
    if (!UserService._instance) {
      UserService._instance = new UserService('default');
    }
    return UserService._instance;
  }
}

// ========== 使用 ==========
// ✅ 静态成员：类名调用
console.log(UserService.VERSION);        // '1.0.0'
console.log(UserService.getTotalUsers()); // 0

const user1 = new UserService('张三');
const user2 = new UserService('李四');

console.log(UserService.getTotalUsers()); // 2

// ✅ 实例属性：实例调用
console.log(user1.name);  // '张三'
console.log(user2.name);  // '李四'

// ❌ 实例访问不到静态
// console.log(user1.totalUsers);  // undefined
// console.log(user1.VERSION);     // undefined

// ❌ 静态访问不到实例
// UserService.name;  // 报错

// ✅ 单例模式
const singleton1 = UserService.getInstance();
const singleton2 = UserService.getInstance();
console.log(singleton1 === singleton2); 
```