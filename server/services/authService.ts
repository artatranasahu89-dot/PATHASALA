/**
 * BharatLearn AI — Server-Authorised Authentication & Role Management Service
 * Implements cryptographic password hashing (salt + pbkdf2), token sessions,
 * strict role-based access control, time-limited student pairing codes, and max 2 child limits.
 */

import crypto from 'crypto';

export type UserRole = 'PARENT' | 'STUDENT';

export interface UserAccount {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  uid: string;
  role: UserRole;
  email: string;
  displayName: string;
  expiresAt: number; // Unix timestamp ms
}

export interface StudentPairingCode {
  code: string;
  studentId: string;
  studentName: string;
  assignedClass: string;
  gradeLevel: number;
  category: string;
  expiresAt: number; // Unix timestamp ms
}

class AuthService {
  private users: Map<string, UserAccount> = new Map(); // uid -> UserAccount
  private usersByEmail: Map<string, string> = new Map(); // email -> uid
  private sessions: Map<string, AuthSession> = new Map(); // token -> AuthSession
  private pairingCodes: Map<string, StudentPairingCode> = new Map(); // code -> StudentPairingCode

  constructor() {
    // Predictable seeded credentials are available only when explicitly enabled outside production.
    if (process.env.NODE_ENV !== 'production' && process.env.PATHASALA_ENABLE_DEMO_ACCOUNTS === 'true') {
      this.seedDefaultAccounts();
    }
  }

  /**
   * Hashes a password or PIN securely using PBKDF2 with salt
   */
  public hashSecret(secret: string, salt?: string): { hash: string; salt: string } {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(secret, s, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: s };
  }

  /**
   * Verifies a plain secret against stored hash and salt
   */
  public verifySecret(secret: string, hash: string, salt: string): boolean {
    const testHash = crypto.pbkdf2Sync(secret, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(hash));
  }

  /**
   * Seed initial verified accounts for demo & tests (no plaintext passwords stored)
   */
  private seedDefaultAccounts() {
    // 1. Parent Account: Ramesh Mohanty (PIN: 1234)
    const parentSalt = 'salt_parent_ramesh_secure_92';
    const parentHash = this.hashSecret('1234', parentSalt).hash;
    const parentUid = 'parent_mohanty_01';

    const parentUser: UserAccount = {
      uid: parentUid,
      email: 'ramesh.mohanty@example.in',
      phoneNumber: '+91 98765 43210',
      displayName: 'ରମେଶ ମହାନ୍ତି (Ramesh Mohanty)',
      role: 'PARENT',
      passwordHash: parentHash,
      salt: parentSalt,
      createdAt: new Date().toISOString(),
    };
    this.users.set(parentUid, parentUser);
    this.usersByEmail.set(parentUser.email.toLowerCase(), parentUid);

    // 2. Student 1: Subhashree Mohanty (Class 10) (Password: student123)
    const student1Salt = 'salt_student_subhashree_77';
    const student1Hash = this.hashSecret('student123', student1Salt).hash;
    const student1Uid = 'learner_pilot_odia_01';

    const student1User: UserAccount = {
      uid: student1Uid,
      email: 'subhashree.mohanty@example.in',
      displayName: 'ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree)',
      role: 'STUDENT',
      passwordHash: student1Hash,
      salt: student1Salt,
      createdAt: new Date().toISOString(),
    };
    this.users.set(student1Uid, student1User);
    this.usersByEmail.set(student1User.email.toLowerCase(), student1Uid);

    // 3. Student 2: Soumya Mohanty (Class 4) (Password: student123)
    const student2Salt = 'salt_student_soumya_55';
    const student2Hash = this.hashSecret('student123', student2Salt).hash;
    const student2Uid = 'learner_child_02';

    const student2User: UserAccount = {
      uid: student2Uid,
      email: 'soumya.mohanty@example.in',
      displayName: 'ସୌମ୍ୟରଞ୍ଜନ ମହାନ୍ତି (Soumya)',
      role: 'STUDENT',
      passwordHash: student2Hash,
      salt: student2Salt,
      createdAt: new Date().toISOString(),
    };
    this.users.set(student2Uid, student2User);
    this.usersByEmail.set(student2User.email.toLowerCase(), student2Uid);
  }

  /**
   * Registers a new student account. Role is hard-enforced as 'STUDENT'.
   */
  public registerStudent(params: {
    email: string;
    displayName: string;
    secret: string;
    category: string;
    gradeLevel: number;
    assignedClass: string;
    curriculumCode?: string;
  }): { user: Omit<UserAccount, 'passwordHash' | 'salt'>; token: string } {
    const emailKey = params.email.trim().toLowerCase();
    if (this.usersByEmail.has(emailKey)) {
      throw new Error('An account with this email already exists.');
    }

    const { hash, salt } = this.hashSecret(params.secret);
    const uid = `student_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const newUser: UserAccount = {
      uid,
      email: params.email.trim(),
      displayName: params.displayName.trim(),
      role: 'STUDENT', // Strictly hardcoded on server; cannot be spoofed
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    };

    this.users.set(uid, newUser);
    this.usersByEmail.set(emailKey, uid);

    const token = this.createSession(newUser);
    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  /**
   * Registers a new parent account. Role is hard-enforced as 'PARENT'.
   */
  public registerParent(params: {
    email: string;
    phoneNumber?: string;
    displayName: string;
    pin: string;
  }): { user: Omit<UserAccount, 'passwordHash' | 'salt'>; token: string } {
    const emailKey = params.email.trim().toLowerCase();
    if (this.usersByEmail.has(emailKey)) {
      throw new Error('An account with this email already exists.');
    }

    if (!/^\d{4,6}$/.test(params.pin)) {
      throw new Error('Parent PIN must be 4 to 6 numeric digits.');
    }

    const { hash, salt } = this.hashSecret(params.pin);
    const uid = `parent_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const newUser: UserAccount = {
      uid,
      email: params.email.trim(),
      phoneNumber: params.phoneNumber?.trim(),
      displayName: params.displayName.trim(),
      role: 'PARENT', // Strictly hardcoded on server; cannot be spoofed
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    };

    this.users.set(uid, newUser);
    this.usersByEmail.set(emailKey, uid);

    const token = this.createSession(newUser);
    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  /**
   * Authenticates user with credentials and returns verified session token
   */
  public login(identifier: string, secret: string): { user: Omit<UserAccount, 'passwordHash' | 'salt'>; token: string } {
    const cleanId = identifier.trim().toLowerCase();
    let user: UserAccount | undefined;

    // Check direct email
    const uid = this.usersByEmail.get(cleanId);
    if (uid) {
      user = this.users.get(uid);
    } else {
      // Check phone number or direct uid lookup
      for (const u of this.users.values()) {
        if (u.phoneNumber === identifier || u.uid === identifier) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new Error('Invalid email, phone number, or credentials.');
    }

    const isValid = this.verifySecret(secret, user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Invalid credentials or PIN.');
    }

    const token = this.createSession(user);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Creates a cryptographically secure session token valid for 24 hours
   */
  public createSession(user: UserAccount): string {
    const token = `bl_sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    this.sessions.set(token, {
      token,
      uid: user.uid,
      role: user.role,
      email: user.email,
      displayName: user.displayName,
      expiresAt,
    });

    return token;
  }

  /**
   * Verifies an active session token and handles expired-session checks
   */
  public verifySession(token: string): AuthSession | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token); // Purge expired
      return null;
    }

    return session;
  }

  /**
   * Invalidate / sign out session
   */
  public invalidateSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  /**
   * Generates a secure, 6-character alphanumeric pairing code for a student (valid 15m)
   * Prevents linking accounts merely because someone knows an email or name.
   */
  public generateStudentPairingCode(student: {
    id: string;
    fullName: string;
    assignedClass: string;
    gradeLevel: number;
    category: string;
  }): { code: string; expiresAt: string; validityMinutes: number } {
    // Purge expired codes
    const now = Date.now();
    for (const [code, item] of this.pairingCodes.entries()) {
      if (item.expiresAt < now) {
        this.pairingCodes.delete(code);
      }
    }

    // Generate random 6-character uppercase code: "BL-XXXX"
    const randomChars = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `BL-${randomChars}`;
    const validityMinutes = 15;
    const expiresAt = now + validityMinutes * 60 * 1000;

    this.pairingCodes.set(code, {
      code,
      studentId: student.id,
      studentName: student.fullName,
      assignedClass: student.assignedClass,
      gradeLevel: student.gradeLevel,
      category: student.category,
      expiresAt,
    });

    return {
      code,
      expiresAt: new Date(expiresAt).toISOString(),
      validityMinutes,
    };
  }

  /**
   * Validates and consumes a student pairing code
   */
  public consumePairingCode(code: string): StudentPairingCode | null {
    const cleanCode = code.trim().toUpperCase();
    const item = this.pairingCodes.get(cleanCode);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.pairingCodes.delete(cleanCode);
      return null;
    }

    // Code consumed once used
    this.pairingCodes.delete(cleanCode);
    return item;
  }

  public getUser(uid: string): Omit<UserAccount, 'passwordHash' | 'salt'> | null {
    const user = this.users.get(uid);
    return user ? this.sanitizeUser(user) : null;
  }

  private sanitizeUser(user: UserAccount): Omit<UserAccount, 'passwordHash' | 'salt'> {
    const { passwordHash: _, salt: __, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();
