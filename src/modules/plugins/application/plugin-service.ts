import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore } from "@/infrastructure/memory/store";

export class PluginService {
  catalog() {
    return getMemoryStore().plugins.filter((p) => p.isPublic);
  }

  installed(tenantId: string) {
    const store = getMemoryStore();
    return store.tenantPlugins
      .filter((tp) => tp.tenantId === tenantId)
      .map((tp) => ({
        ...tp,
        plugin: store.plugins.find((p) => p.id === tp.pluginId) ?? null,
      }));
  }

  install(tenantId: string, pluginCode: string) {
    const store = getMemoryStore();
    const plugin = store.plugins.find((p) => p.code === pluginCode);
    if (!plugin) throw AppError.notFound("Plugin", pluginCode);
    const existing = store.tenantPlugins.find(
      (tp) => tp.tenantId === tenantId && tp.pluginId === plugin.id,
    );
    if (existing) {
      existing.status = "ENABLED";
      return existing;
    }
    const record = {
      id: createId("tp"),
      tenantId,
      pluginId: plugin.id,
      status: "ENABLED" as const,
      config: {},
      installedAt: new Date().toISOString(),
    };
    store.tenantPlugins.push(record);
    return record;
  }

  setStatus(tenantId: string, pluginId: string, status: "ENABLED" | "DISABLED") {
    const tp = getMemoryStore().tenantPlugins.find(
      (x) => x.tenantId === tenantId && x.pluginId === pluginId,
    );
    if (!tp) throw AppError.notFound("TenantPlugin", pluginId);
    tp.status = status;
    return tp;
  }
}
