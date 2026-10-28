import { Router } from "express";
import { nameSchema } from "../../shared/schemas.ts";
import { many, one, run } from "../db.ts";
import { conflict, notFound, paramId } from "../errors.ts";

interface NamedRow {
  id: number;
  name: string;
}

export function createNamedResourceRouter(table: "topics" | "venues", label: string): Router {
  const router = Router();

  const find = (id: number) => one<NamedRow>(`SELECT id, name FROM ${table} WHERE id = ?`, id);

  const assertUniqueName = async (name: string, excludeId = 0) => {
    if (await one(`SELECT 1 FROM ${table} WHERE name = ? AND id != ?`, name, excludeId)) {
      throw conflict("name", `That ${label.toLowerCase()} already exists`);
    }
  };

  router.get("/", async (_req, res) => {
    res.json(await many<NamedRow>(`SELECT id, name FROM ${table} ORDER BY name`));
  });

  router.get("/:id", async (req, res) => {
    const item = await find(paramId(req, "id"));
    if (!item) throw notFound(label);
    res.json(item);
  });

  router.post("/", async (req, res) => {
    const { name } = nameSchema.parse(req.body);
    await assertUniqueName(name);
    const { lastInsertRowid } = await run(`INSERT INTO ${table} (name) VALUES (?)`, name);
    res.status(201).json(await find(lastInsertRowid));
  });

  router.put("/:id", async (req, res) => {
    const id = paramId(req, "id");
    if (!(await find(id))) throw notFound(label);
    const { name } = nameSchema.parse(req.body);
    await assertUniqueName(name, id);
    await run(`UPDATE ${table} SET name = ? WHERE id = ?`, name, id);
    res.json(await find(id));
  });

  return router;
}
