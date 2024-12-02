import getConnection from "./conn.js";
import { ObjectId } from "mongodb";
const DATABASE = "sample_supplies";
const SALES = "sales";

export async function getSalesByFilters(storeLocation, purchaseMethod, couponUsed, page, limit) {
  try {
    const connectiondb = await getConnection();
    const query = {};

    // Verifica los parámetros de entrada y los agrega al query
    if (storeLocation) {
      query.storeLocation = storeLocation;
    }

    if (purchaseMethod) {
      query.purchaseMethod = purchaseMethod;
    }

    if (couponUsed !== undefined) {
      query.couponUsed = couponUsed === "true"; // Asegura que sea un booleano
    }

    // Paginación
    const pageNum = parseInt(page) || 0;
    const limitNum = parseInt(limit) || 10;

    // Realiza la consulta a la base de datos con los filtros y la paginación
    const sales = await connectiondb
      .db(DATABASE)
      .collection(SALES)
      .find(query)
      .skip(pageNum * limitNum)
      .limit(limitNum)
      .toArray();

    if (sales.length === 0) {
      throw new Error("No se encontraron ventas con los filtros especificados.");
    }

    return sales;
  } catch (error) {
    console.error("Error al obtener ventas:", error.message);
    throw new Error("No se pudo obtener las ventas. Verifica los parámetros.");
  }
}

export async function getAllSales(pageSize, page) { //EJ: http://localhost:3000/api/sales?pageSize=[pageSize]&page=[page]
  const connectiondb = await getConnection();
  const sales = await connectiondb
    .db(DATABASE)
    .collection(SALES)
    .find({})
    .limit(pageSize)
    .skip(pageSize * page)
    .toArray();
  return sales;
}

export async function getSaleById(id) {
  try {
    const connectiondb = await getConnection();
    const sale = await connectiondb
      .db(DATABASE)
      .collection(SALES)
      .findOne({ _id: new ObjectId(id) }); // Busca por ObjectId
    return sale;
  } catch (error) {
    console.error("Error obteniendo la venta por ID:", error);
    throw new Error("No se pudo obtener la venta. Verifica el ID.");
  }
}

export async function getSalesByLocation(location) {
  const connectiondb = await getConnection();
  const sales = await connectiondb
    .db(DATABASE)
    .collection(SALES)
    .find({ storeLocation: location })  // Filtra por la ubicación
    .toArray();
  return sales;
}


export async function getTopProducts() {
  try {
    const connectiondb = await getConnection();

    // Utilizamos aggregate para agrupar por nombre de producto y sumar la cantidad vendida
    const topProducts = await connectiondb
      .db(DATABASE)
      .collection(SALES)
      .aggregate([
        { $unwind: "$items" }, // Desestructuramos el array de productos en cada venta
        { $group: { // Agrupamos por nombre de producto
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" }, // Sumamos las cantidades
        }},
        { $sort: { totalQuantity: -1 } }, // Ordenamos de mayor a menor cantidad
        { $limit: 10 } // Limitar a los primeros 10 productos
      ])
      .toArray();

    return topProducts;
  } catch (error) {
    console.error("Error obteniendo los productos más vendidos:", error.message);
    throw new Error("No se pudieron obtener los productos más vendidos.");
  }
}
