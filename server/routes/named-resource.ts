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

  const assertUniqueName = (name: string, excludeId = 0) => {
    if (one(`SELECT 1 FROM ${table} WHERE name = ? AND id != ?`, name, excludeId)) {
      throw conflict("name", `That ${label.toLowerCase()} already exists`);
    }
  };

  router.get("/", (_req, res) => {
    res.json(many<NamedRow>(`SELECT id, name FROM ${table} ORDER BY name`));
  });

  router.get("/:id", (req, res) => {
    const item = find(paramId(req, "id"));
    if (!item) throw notFound(label);
    res.json(item);
  });

  router.post("/", (req, res) => {
    const { name } = nameSchema.parse(req.body);
    assertUniqueName(name);
    const { lastInsertRowid } = run(`INSERT INTO ${table} (name) VALUES (?)`, name);
    res.status(201).json(find(Number(lastInsertRowid)));
  });

  router.put("/:id", (req, res) => {
    const id = paramId(req, "id");
    if (!find(id)) throw notFound(label);
    const { name } = nameSchema.parse(req.body);
    assertUniqueName(name, id);
    run(`UPDATE ${table} SET name = ? WHERE id = ?`, name, id);
    res.json(find(id));
  });

  return router;
}
