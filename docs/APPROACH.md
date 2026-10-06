# Project Approach & Architecture — Build Secure 24

**Team ID:** [YOUR TEAM ID]
**Project Name:** MarketHub
**Team Size:** 2 Members
**Primary Track / Domain:** PS-02 — Secure Multi-Vendor Marketplace / Cybersecurity

---

## 1. Problem Understanding, Scope & Threat Model

### 1.1 Problem Statement & Real-World Motivation

MarketHub is a security-first multi-vendor e-commerce marketplace designed to allow customers, vendors and administrators to interact through a controlled and secure platform.

Traditional marketplaces expose multiple attack surfaces because different user roles interact with products, inventory, orders and administrative functions.

The primary security challenges are:

- Account compromise
- Broken access control
- IDOR/BOLA vulnerabilities
- SQL injection
- Cross-site scripting
- Session abuse
- API manipulation
- Price and order tampering
- Brute-force and automated abuse
- Unauthorized vendor/admin operations

The core design principle is:

**Never trust the client. Security decisions and business-critical validation are performed server-side.**

---

### 1.2 Target Users & Personas

#### Customer
- Register and authenticate
- Browse and search products
- Add products to cart
- Create orders
- Track orders

Trust level: Untrusted external user

#### Vendor
- Maintain vendor profile
- Create and manage products
- Manage inventory
- Process vendor orders

Trust level: Authenticated but restricted user

#### Administrator
- Manage users and vendors
- Moderate products
- Monitor platform activity
- Perform administrative operations

Trust level: Highly privileged user

---

### 1.3 Threat Model & Attack Surface

#### Critical Assets

- User credentials
- Authentication/session information
- Customer and vendor information
- Product and inventory data
- Order information
- Administrative functions
- Business rules and pricing
- Security/audit logs
- Application secrets

#### Potential Attack Vectors

- Credential stuffing and brute force
- SQL injection
- Cross-site scripting
- IDOR/BOLA
- Broken authentication
- Privilege escalation
- Unauthorized API access
- Request parameter manipulation
- Price manipulation
- Order tampering
- CSRF
- Excessive API requests
- Malicious product/review content

#### OWASP Top 10 Considerations

The application will specifically consider:

- Broken Access Control
- Cryptographic Failures
- Injection
- Insecure Design
- Security Misconfiguration
- Identification and Authentication Failures
- Software and Data Integrity Failures
- Security Logging and Monitoring Failures
- SSRF where applicable

---

## 2. Technical Architecture & Secure System Design

### 2.1 High-Level Architecture Overview

MarketHub will use a layered architecture:

Client
→ Security Middleware
→ Authentication
→ Authorization
→ API / Business Logic
→ Database

The architecture separates presentation, business logic and persistence while applying security controls at each trust boundary.

---

### 2.2 Data Flow & Component Interaction

1. A user sends a request through the web interface.
2. HTTPS protects communication in deployment.
3. Security middleware applies request and rate-limit controls.
4. Authentication verifies the user's identity.
5. Authorization verifies role and resource ownership.
6. Request data is validated against expected schemas.
7. Business logic performs server-side security checks.
8. Database operations use parameterized queries/ORM mechanisms.
9. Transaction-sensitive operations are processed atomically.
10. Security-relevant events are recorded in the audit system.
11. A controlled response is returned without exposing sensitive internal information.

### Trust Boundaries

- Browser → Application
- Application → API
- API → Database
- User → Role-protected resources
- Vendor → Vendor-owned resources
- Admin → Privileged resources

---

### 2.3 Technology Stack Rationale

#### Backend / API Framework
**Node.js + Express**

Why:
- Lightweight and suitable for rapid hackathon development
- Large ecosystem
- Strong middleware support
- Easy implementation of authentication, validation and security middleware

#### Frontend / Client
**React**

Why:
- Component-based architecture
- Suitable for role-based interfaces
- Fast development of customer, vendor and admin dashboards

#### Database & Persistence
**PostgreSQL**

Why:
- Strong relational integrity
- Foreign keys and constraints
- Transaction support
- Suitable for users, products, inventory and orders

#### Authentication & Cryptography

- Argon2id for password hashing where supported
- Cryptographically secure session/token mechanisms
- Secure, HttpOnly and SameSite cookies where cookie-based sessions are used
- Environment variables for secrets

---

## 2.4 Defense-in-Depth Security Controls

### 1. Authentication & Session Security

- Password hashing using Argon2id
- Strong password requirements
- Secure session handling
- HttpOnly cookies
- Secure cookies in HTTPS deployment
- SameSite cookie protection
- Session expiration and rotation
- Login rate limiting
- Generic authentication error messages
- Administrative MFA as an advanced security control

### 2. Authorization & Access Control

- Role-Based Access Control
- Server-side authorization
- Object-level ownership checks
- Customer/vendor/admin permission separation
- Protection against IDOR/BOLA
- Deny-by-default authorization

Example:

A vendor can modify only products belonging to that vendor. Changing a product ID must never bypass ownership verification.

### 3. Input Validation & Sanitization

- Strict request schema validation
- Allow-list validation
- Type validation
- Length and range limits
- Safe output encoding
- Parameterized database queries
- Protection against SQL injection
- Safe error responses

### 4. Rate Limiting & Abuse Prevention

Different limits will be applied to sensitive endpoints:

- Login
- Registration
- Password-related endpoints
- Product creation
- Order creation
- Administrative APIs

The objective is to reduce brute-force attacks and automated abuse.

### 5. Secrets & Configuration Hygiene

- No hardcoded passwords
- No hardcoded API keys
- Environment variables for secrets
- `.env` excluded from Git
- Secure production configuration
- Separate development and production configuration
- Minimal database privileges

### 6. Security Headers

The deployment will use security headers where applicable, including:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Frame protection through appropriate CSP configuration

### 7. Business Logic Protection

Critical values will never be trusted from the client.

For example:

- Product price is retrieved from the server/database
- Order totals are calculated server-side
- User identity comes from the authenticated session
- Vendor ownership is verified server-side
- Inventory is validated before order creation
- Order status transitions are controlled by business rules

### 8. Audit Logging

Security-relevant events will be recorded, including:

- Successful/failed authentication
- Authorization failures
- Administrative actions
- Product changes
- Order creation
- Role changes
- Rate-limit events

Passwords, tokens and other sensitive secrets will never be written to logs.

---

## 3. Implementation Milestones & 24-Hour Timeline

| Milestone / Phase | Time Window | Key Objectives & Deliverables | Security Verification | Status |
|---|---|---|---|---|
| Phase 1: Foundation & Setup | 0h – 4h | Repository, architecture, database schema, application skeleton | Secret/configuration check | Planned |
| Phase 2: Core Domain & Auth | 4h – 12h | Authentication, RBAC, products, cart and orders | Authentication and authorization tests | Planned |
| Phase 3: Security & Hardening | 12h – 18h | Validation, rate limiting, security headers, secure errors, audit logging | Attack simulation and security tests | Planned |
| Phase 4: Polish & Deployment | 18h – 24h | UI refinement, deployment, documentation and final verification | Live security verification | Planned |

---

## 4. Architecture Decision Records (ADRs)

### ADR-001: Layered Secure Architecture

- **Status:** Accepted

- **Context:**
  MarketHub contains multiple user roles and security-sensitive operations. A layered architecture is required to separate responsibilities and enforce security controls.

- **Options Considered:**
  1. Monolithic client-heavy architecture
  2. Layered client/API/database architecture

- **Decision & Rationale:**
  Use a layered architecture with security enforcement on the server. This prevents the frontend from becoming a trusted security boundary.

- **Security & Performance Trade-offs:**
  Additional validation and authorization checks introduce small processing overhead but significantly improve security and maintainability.

---

### ADR-002: Server-Side Authorization

- **Status:** Accepted

- **Context:**
  Client-side role restrictions can be bypassed by modifying requests directly.

- **Options Considered:**
  1. Client-side authorization only
  2. Server-side RBAC with object-level authorization

- **Decision & Rationale:**
  Use server-side RBAC combined with ownership checks.

- **Security & Performance Trade-offs:**
  Each protected request requires authorization checks, but this provides strong protection against IDOR/BOLA and privilege escalation.

---

## 5. Engineering Journal & Real-Time Decision Log

### [2026-10-06] Entry 1: Project Initialization & Scope Lock

- **Focus:** Official starter repository setup, GitHub repository configuration, team metadata and security-first project scope.
- **Key Challenges:** Establishing the repository and following the hackathon's live-authorship and logging requirements.
- **Resolution:** Official starter repository was used and the team repository was configured. MarketHub was selected as a security-first multi-vendor marketplace.

### Entry 2: Secure Architecture Planning

- **Focus:** Threat model, layered architecture, authentication, authorization and defense-in-depth controls.
- **Key Challenges:** Protecting multiple user roles and business-critical marketplace operations.
- **Resolution:** Adopt server-side authorization, strict validation, secure sessions, protected database access and transaction-level business rules.

---

## 6. Testing, Security Verification & Deployment Record

### 6.1 Testing & Security Verification Strategy

Testing will include:

- Unit testing
- API/integration testing
- Authentication testing
- Authorization testing
- Object ownership testing
- Input validation testing
- SQL injection testing
- XSS testing
- IDOR/BOLA testing
- Session security testing
- Price/order manipulation testing
- Rate-limit testing
- Negative testing

Security testing workflow:

**Identify → Reproduce → Capture evidence → Fix → Retest → Document**

### 6.2 Deployment Verification

- **Live Deployment Platform:** To be selected
- **Deployment URL:** To be added after deployment
- **Health Check Endpoint:** `/api/health`

Deployment verification will include:

- HTTPS verification
- Application health check
- Authentication verification
- Authorization verification
- Security header verification
- API availability verification
- Final security smoke test

---