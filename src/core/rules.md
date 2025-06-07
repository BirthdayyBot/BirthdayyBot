# Rules for Hexagonal Architecture (Ports & Adapters)

## 1. General Principles

- The business domain (`core/domain`) is independent of frameworks, libraries, and technical details.
- Dependencies always flow from the outside towards the domain, never the other way around.
- Ports (interfaces) define the entry/exit points of the domain.
- Adapters implement the ports to interact with the outside world (database, APIs, Discord, etc).

## 2. Folder Structure

- `core/domain/`: Entities, aggregates, domain services, ports (interfaces), domain exceptions.
- `core/infrastructure/`: Technical adapters (port implementations), database access, external APIs, cache, etc.
- `commands/`, `listeners/`, `routes/`: Primary adapters (entry points, e.g., Discord commands, REST API, events).

## 3. Dependency Rules

- Domain code does not depend on any technical module or framework.
- Adapters depend on the domain, never the other way around.
- Ports are defined in the domain and implemented in the infrastructure.

## 4. Testing

- Unit tests target the domain (`core/domain`).
- Integration tests target the adapters.

## 5. Best Practices

- Keep the domain pure and free of side effects.
- Inject dependencies via ports.
- Clearly separate business logic from technical logic.
- Document each port and adapter.

## 6. Example Flow

1. A primary adapter (e.g., Discord command) receives a request.
2. It converts the request into a call to a domain port.
3. The domain executes the business logic.
4. If needed, the domain uses a secondary port (e.g., repository) to access the infrastructure.
5. The secondary adapter performs the technical operation (e.g., DB access).

---

Following these rules ensures the maintainability, testability, and scalability of the project.
