import "../../database/associations";
import { syncDatabase } from "../../database/db";
import { User } from "../../features/auth/users/user.model";
import { Role } from "../../features/auth/roles/role.model";
import { RoleUser } from "../../features/auth/role-users/role-user.model";
import { Resource } from "../../features/auth/resources/resource.model";
import { ResourceRole } from "../../features/auth/resource-roles/resource-role.model";
import { Categoria } from "../../features/business/categorias/categoria.model";
import { Libro } from "../../features/business/libros/libro.model";
import { Lector } from "../../features/business/lectores/lector.model";
import { Prestamo } from "../../features/business/prestamos/prestamo.model";
import { DetallePrestamo } from "../../features/business/detalle-prestamos/detalle-prestamo.model";

async function seed() {
  await syncDatabase();

  // 1. Roles
  const [adminRole] = await Role.findOrCreate({
    where: { name: "ADMIN" },
    defaults: { name: "ADMIN", description: "Administrador total del sistema", status: "active" },
  });

  const [biblioRole] = await Role.findOrCreate({
    where: { name: "BIBLIOTECARIO" },
    defaults: { name: "BIBLIOTECARIO", description: "Gestión operativa de biblioteca", status: "active" },
  });

  // 2. Usuarios
  const [adminUser] = await User.findOrCreate({
    where: { username: "admin" },
    defaults: {
      username: "admin",
      email: "admin@lecturaabierta.local",
      password: "Admin123!",
      status: "active",
    },
  });

  const [biblioUser] = await User.findOrCreate({
    where: { username: "bibliotecario" },
    defaults: {
      username: "bibliotecario",
      email: "bibliotecario@lecturaabierta.local",
      password: "Biblio123!",
      status: "active",
    },
  });

  // 3. Asignación de roles
  await RoleUser.findOrCreate({
    where: { user_id: adminUser.id, role_id: adminRole.id },
    defaults: { user_id: adminUser.id, role_id: adminRole.id, status: "active" },
  });

  await RoleUser.findOrCreate({
    where: { user_id: biblioUser.id, role_id: biblioRole.id },
    defaults: { user_id: biblioUser.id, role_id: biblioRole.id, status: "active" },
  });

  // 4. Recursos y permisos
  const paths = [
    "/api/lectores", "/api/lectores/:id", "/api/lectores/:id/deactivate",
    "/api/categorias", "/api/categorias/:id", "/api/categorias/:id/deactivate",
    "/api/libros", "/api/libros/:id", "/api/libros/:id/deactivate",
    "/api/prestamos", "/api/prestamos/:id", "/api/prestamos/:id/deactivate",
    "/api/detalle-prestamos", "/api/detalle-prestamos/:id", "/api/detalle-prestamos/:id/deactivate",
    "/api/usuarios", "/api/usuarios/:id", "/api/usuarios/:id/permisos", "/api/usuarios/:id/deactivate", "/api/usuarios/:id/reactivate",
    "/api/roles", "/api/roles/:id", "/api/roles/:id/deactivate",
    "/api/recursos", "/api/recursos/:id", "/api/recursos/:id/deactivate",
    "/api/asignaciones-rol", "/api/asignaciones-rol/:id", "/api/asignaciones-rol/:id/deactivate", "/api/asignaciones-rol/:id/reactivate",
    "/api/concesiones-rol", "/api/concesiones-rol/:id", "/api/concesiones-rol/:id/deactivate", "/api/concesiones-rol/:id/reactivate",
  ];

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

  for (const path of paths) {
    for (const method of methods) {
      const [resource] = await Resource.findOrCreate({
        where: { path, method },
        defaults: { path, method, description: `${method} ${path}`, status: "active" },
      });

      await ResourceRole.findOrCreate({
        where: { resource_id: resource.id, role_id: adminRole.id },
        defaults: { resource_id: resource.id, role_id: adminRole.id, status: "active" },
      });

      const isBusiness =
        path.startsWith("/api/lectores") ||
        path.startsWith("/api/categorias") ||
        path.startsWith("/api/libros") ||
        path.startsWith("/api/prestamos") ||
        path.startsWith("/api/detalle-prestamos");

      if (isBusiness && method !== "DELETE") {
        await ResourceRole.findOrCreate({
          where: { resource_id: resource.id, role_id: biblioRole.id },
          defaults: { resource_id: resource.id, role_id: biblioRole.id, status: "active" },
        });
      }
    }
  }

  // 5. Categorías
  const [catLiteratura] = await Categoria.findOrCreate({
    where: { nombre: "Literatura Latinoamericana" },
    defaults: { nombre: "Literatura Latinoamericana", descripcion: "Novelas y cuentos clásicos", status: "active" },
  });
  const [catTecnologia] = await Categoria.findOrCreate({
    where: { nombre: "Tecnología y Sistemas" },
    defaults: { nombre: "Tecnología y Sistemas", descripcion: "Programación, IA y bases de datos", status: "active" },
  });
  const [catHistoria] = await Categoria.findOrCreate({
    where: { nombre: "Historia y Cultura" },
    defaults: { nombre: "Historia y Cultura", descripcion: "Historia universal y regional", status: "active" },
  });

  // 6. Libros
  const [libro1] = await Libro.findOrCreate({
    where: { titulo: "Cien años de soledad" },
    defaults: {
      titulo: "Cien años de soledad",
      autor: "Gabriel García Márquez",
      precio_prestamo: 5000,
      stock_minimo: 3,
      cantidad: 12,
      categoria_id: catLiteratura.id,
      status: "active",
    },
  });
  const [libro2] = await Libro.findOrCreate({
    where: { titulo: "Clean Code" },
    defaults: {
      titulo: "Clean Code",
      autor: "Robert C. Martin",
      precio_prestamo: 8000,
      stock_minimo: 4,
      cantidad: 2, // Stock bajo intencional para el panel
      categoria_id: catTecnologia.id,
      status: "active",
    },
  });
  const [libro3] = await Libro.findOrCreate({
    where: { titulo: "El otoño del patriarca" },
    defaults: {
      titulo: "El otoño del patriarca",
      autor: "Gabriel García Márquez",
      precio_prestamo: 4500,
      stock_minimo: 2,
      cantidad: 7,
      categoria_id: catLiteratura.id,
      status: "active",
    },
  });
  const [libro4] = await Libro.findOrCreate({
    where: { titulo: "Inteligencia Artificial Moderna" },
    defaults: {
      titulo: "Inteligencia Artificial Moderna",
      autor: "Stuart Russell",
      precio_prestamo: 9500,
      stock_minimo: 3,
      cantidad: 1, // Stock bajo intencional para el panel
      categoria_id: catTecnologia.id,
      status: "active",
    },
  });

  // 7. Lectores
  const [lector1] = await Lector.findOrCreate({
    where: { email: "maria.gomez@ejemplo.com" },
    defaults: {
      nombre: "María Fernanda Gómez",
      direccion: "Calle 12 # 8-45",
      telefono: "3001234567",
      email: "maria.gomez@ejemplo.com",
      status: "active",
    },
  });
  const [lector2] = await Lector.findOrCreate({
    where: { email: "carlos.perez@ejemplo.com" },
    defaults: {
      nombre: "Carlos Andrés Pérez",
      direccion: "Carrera 7 # 14-20",
      telefono: "3019876543",
      email: "carlos.perez@ejemplo.com",
      status: "active",
    },
  });

  // 8. Préstamos de ejemplo (solo si aún no existen)
  const prestamosCount = await Prestamo.count();
  if (prestamosCount === 0) {
    const p1 = await Prestamo.create({
      fecha_prestamo: new Date(),
      subtotal: 13000,
      impuesto: 0,
      descuentos: 0,
      total: 13000,
      lector_id: lector1.id,
      status: "active",
    });

    await DetallePrestamo.bulkCreate([
      {
        prestamo_id: p1.id,
        libro_id: libro1.id,
        cantidad: 1,
        precio_unitario: 5000,
        total_linea: 5000,
        status: "active",
      },
      {
        prestamo_id: p1.id,
        libro_id: libro2.id,
        cantidad: 1,
        precio_unitario: 8000,
        total_linea: 8000,
        status: "active",
      },
    ]);

    const p2 = await Prestamo.create({
      fecha_prestamo: new Date(),
      subtotal: 9500,
      impuesto: 0,
      descuentos: 500,
      total: 9000,
      lector_id: lector2.id,
      status: "active",
    });

    await DetallePrestamo.create({
      prestamo_id: p2.id,
      libro_id: libro4.id,
      cantidad: 1,
      precio_unitario: 9500,
      total_linea: 9500,
      status: "active",
    });
  }

  console.log("✅ Seed completo: usuarios, permisos, categorías, libros, lectores y préstamos cargados.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error ejecutando seed:", err);
  process.exit(1);
});
