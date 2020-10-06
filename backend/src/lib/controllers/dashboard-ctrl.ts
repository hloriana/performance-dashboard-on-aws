import { Request, Response } from "express";
import { ItemNotFound } from "../errors";
import { Dashboard, DashboardState } from "../models/dashboard";
import DashboardFactory from "../factories/dashboard-factory";
import AuthService from "../services/auth";
import DashboardRepository from "../repositories/dashboard-repo";
import TopicAreaRepository from "../repositories/topicarea-repo";

async function listDashboards(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);

  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }

  const repo = DashboardRepository.getInstance();
  const dashboards = await repo.listDashboards();
  res.json(dashboards);
}

async function createDashboard(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);

  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { topicAreaId, name, description } = req.body;

  if (!topicAreaId) {
    res.status(400).send("Missing required field `topicAreaId`");
    return;
  }

  if (!name) {
    res.status(400).send("Missing required field `name`");
    return;
  }

  const topicArea = await TopicAreaRepository.getInstance().getTopicAreaById(
    topicAreaId
  );
  const dashboard = DashboardFactory.createNew(
    name,
    topicAreaId,
    topicArea.name,
    description,
    user
  );

  const repo = DashboardRepository.getInstance();
  await repo.putDashboard(dashboard);
  res.json(dashboard);
}

async function getDashboardById(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);
  if (!user) {
    res.status(401);
    return res.send("Unauthorized");
  }

  const { id } = req.params;
  const repo = DashboardRepository.getInstance();

  try {
    const dashboard = await repo.getDashboardWithWidgets(id);
    return res.json(dashboard);
  } catch (err) {
    if (err instanceof ItemNotFound) {
      res.status(404);
      return res.send("Dashboard not found");
    }
    throw err;
  }
}

async function getPublicDashboardById(req: Request, res: Response) {
  const { id } = req.params;

  const repo = DashboardRepository.getInstance();
  let dashboard: Dashboard;

  try {
    dashboard = await repo.getDashboardWithWidgets(id);
  } catch (err) {
    if (err instanceof ItemNotFound) {
      res.status(404);
      return res.send("Dashboard not found");
    }
    throw err;
  }

  if (dashboard.state !== DashboardState.Published) {
    res.status(404);
    return res.send("Dashboard not found");
  }

  const publicDashboard = DashboardFactory.toPublic(dashboard);
  return res.json(publicDashboard);
}

async function updateDashboard(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);

  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { id } = req.params;
  const { name, topicAreaId, description, updatedAt } = req.body;

  if (!name) {
    res.status(400).send("Missing required body `name`");
    return;
  }

  if (!topicAreaId) {
    res.status(400).send("Missing required body `topicAreaId`");
    return;
  }

  if (!updatedAt) {
    res.status(400).send("Missing required body `updatedAt`");
    return;
  }

  const topicArea = await TopicAreaRepository.getInstance().getTopicAreaById(
    topicAreaId
  );
  const dashboard = DashboardFactory.create(
    id,
    name,
    topicAreaId,
    topicArea.name,
    description,
    DashboardState.Draft,
    user,
    new Date(updatedAt)
  );

  const repo = DashboardRepository.getInstance();
  await repo.updateDashboard(dashboard, user);
  res.send();
}

async function publishDashboard(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);

  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { id } = req.params;
  const { updatedAt } = req.body;

  if (!updatedAt) {
    res.status(400).send("Missing required body `updatedAt`");
    return;
  }

  const repo = DashboardRepository.getInstance();
  await repo.publishDashboard(id, updatedAt, user);
  res.send();
}

async function deleteDashboard(req: Request, res: Response) {
  const user = AuthService.getCurrentUser(req);

  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { id } = req.params;

  const repo = DashboardRepository.getInstance();
  await repo.delete(id);
  return res.send();
}

export default {
  listDashboards,
  createDashboard,
  getDashboardById,
  updateDashboard,
  publishDashboard,
  deleteDashboard,
  getPublicDashboardById,
};
