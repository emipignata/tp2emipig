import express from "express";
import { getAllSales, getSaleById, getSalesByLocation,getSalesByFilters,getTopProducts} from "../data/sales.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
  const page = req.query.page ? parseInt(req.query.page) : 0;

  res.json(await getAllSales(pageSize, page));
});

router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await getSaleById(id);
    if (sale) {
      res.json(sale);
    } else {
      res.status(404).json({ error: "Venta no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener ventas filtradas por storeLocation
router.get("/location/:location", async (req, res) => {
  const { location } = req.params;

  try {
    // Filtra las ventas por la ubicación
    const sales = await getSalesByLocation(location);
    if (sales.length > 0) {
      res.json(sales);
    } else {
      res.status(404).json({ error: `No se encontraron ventas en ${location}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/filter", async (req, res) => {
  const { storeLocation, purchaseMethod, couponUsed } = req.query;

  try {
    // Llamamos a la función que filtra las ventas por los criterios proporcionados
    const sales = await getSalesByFilters(storeLocation, purchaseMethod, couponUsed);

    if (sales.length > 0) {
      res.json(sales);
    } else {
      res.status(404).json({ error: "No se encontraron ventas con los filtros especificados" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/top", async (req, res) => {
  try {
    const topProducts = await getTopProducts();
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




export default router;
