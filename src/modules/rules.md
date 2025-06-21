# Rules for Hexagonal Architecture with Modular Structure

## 1. General Principles

- Business logic is isolated in the domain layer of each module
- Dependencies flow from outside towards the domain
- Modules are independent and self-contained
- Core module provides shared infrastructure

## 2. Module Structure

```
src/
├── modules/
│   ├── birthday/         # Functional module
│   │   ├── controllers/  # Primary adapters
│   │   ├── domain/      # Business logic
│   │   ├── enum/        # Type definitions
│   │   ├── middleware/  # Request interceptors
│   │   ├── repositories/# Secondary adapters
│   │   ├── services/    # Domain orchestration
│   │   └── view_models/ # DTOs
│   └── core/            # Shared infrastructure
```

## 3. Layer Responsibilities

### Domain Layer

- Contains pure business logic
- Defines interfaces (ports)
- Independent of technical details

### Repository Layer

- Implements secondary adapters
- Manages data access and caching
- Inherits from an abstract base class

### Service Layer

- Orchestrates domain logic
- Uses repositories through interfaces
- Remains framework agnostic

### Controller Layer

- Implements primary adapters
- Converts requests to domain calls
- Uses services for processing

## 4. Dependency Rules

- Modules can depend on core
- Modules are independent of each other
- Dependencies injected via constructors
- Configuration centralized in bootstrap

## 5. Example Pattern

```typescript
abstract class BaseRepository<T> {
	constructor(protected readonly cache: BentoCache) {}

	// Public methods with caching
	async find(): Promise<T> {
		return this.cache.wrap(key, () => this.findFromSource());
	}

	// Protected methods to implement
	protected abstract findFromSource(): Promise<T>;
}
```

## 6. Testing Strategy

- Unit tests for domain logic
- Integration tests for repositories
- Functional tests for controllers
- Mocks for external dependencies

## 7. Request Flow

1. Controller receives Discord command
2. Converts to a domain model
3. Calls the appropriate service
4. Service uses repository
5. Repository handles cache/data
6. Returns transformed data

## 8. Best Practices

- One module = one business feature
- Clear separation of concerns
- Document interfaces
- Use strict TypeScript
- Follow SOLID principles

---

This architecture provides:

- Clear and intuitive organization
- Maintained hexagonal principles
- Easy navigation
- Efficient caching
- Simple evolution
