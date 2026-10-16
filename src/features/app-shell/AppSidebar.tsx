import {
  ArrowsLeftRight as SubscriptionProxyIcon,
  ArrowCircleUp as UpdateAvailableIcon,
  GearSix as SettingsIcon,
  Key as KeyIcon,
  ShieldCheck as ShieldCheckIcon,
  Stack as LayersIcon,
} from "@phosphor-icons/react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl as openExternalUrl } from "@tauri-apps/plugin-opener";
import { useEffect, useState, type CSSProperties, type RefObject, type MouseEvent } from "react";
import {
  APP_OFFICIAL_SITE_URL,
  APP_LICENSE_PURCHASE_SESSION_URL,
  type AppLanguage,
} from "../../appConstants.ts";
import {
  appUpdateInstallButtonLabel,
  isAppUpdateInstallBusy,
  type AppUpdateInstallState,
} from "../../appUpdater.ts";
import type { AppUpdateCheckResult, LicenseActivationStatus, TargetKey } from "../../appTypes.ts";
import { isAppStoreDistribution } from "../../distribution.ts";
import { Chip, Button, Input } from "../../nativeUi.tsx";
import { TargetLogo } from "../../components/AppUiPrimitives.tsx";
import { visibleTargetOptions } from "../../targetOptions.ts";

const showLicenseControls = !isAppStoreDistribution;

function settingsText(language: AppLanguage) {
  return language === "en"
    ? {
      activate: "Activate",
      activating: "Activating",
      activationTitle: "License Activation",
      buyLicense: "Buy License Code",
      close: "Close",
      currentVersion: "Current Version",
      enterLicenseCode: "Enter license code",
      interfaceLanguage: "Interface language",
      licensedUser: "Licensed User",
      noLicensedUser: "No licensed user recorded",
      officialSite: "Website",
      opening: "Opening",
      settings: "Settings",
      trial: "Trial",
      trialEnded: "Trial ended",
      trialing: "Trial",
      unactivated: "Not activated",
      activated: "Activated",
    }
    : {
      activate: "激活",
      activating: "激活中",
      activationTitle: "授权激活",
      buyLicense: "购买授权码",
      close: "关闭",
      currentVersion: "当前版本",
      enterLicenseCode: "输入授权码",
      interfaceLanguage: "界面语言",
      licensedUser: "授权用户",
      noLicensedUser: "未记录授权用户",
      officialSite: "官网",
      opening: "打开中",
      settings: "设置",
      trial: "试用",
      trialEnded: "试用已结束",
      trialing: "试用中",
      unactivated: "未激活",
      activated: "已激活",
    };
}

function activationStatusText(status: LicenseActivationStatus | null | undefined, language: AppLanguage) {
  const text = settingsText(language);
  if (!status?.activated) {
    if (status?.license_state === "expired" || status?.access_allowed === false) {
      return text.trialEnded;
    }
    if (typeof status?.trial_days_remaining === "number") {
      return language === "en"
        ? `${text.trialing} · ${status.trial_days_remaining} ${status.trial_days_remaining === 1 ? "day" : "days"}`
        : `${text.trialing} · ${status.trial_days_remaining} 天`;
    }
    return text.unactivated;
  }
  return `${text.activated} · **** ${status.code_suffix ?? "----"}`;
}

function licenseBrandBadgeText(status: LicenseActivationStatus | null | undefined, language: AppLanguage) {
  if (status?.activated) {
    return null;
  }
  const text = settingsText(language);
  if (status?.license_state === "expired" || status?.access_allowed === false) {
    return text.trialEnded;
  }
  return text.trial;
}

async function createLicensePurchaseSession() {
  const response = await fetch(APP_LICENSE_PURCHASE_SESSION_URL, { method: "POST" });
  const data = await response.json() as { buy_url?: string; message?: string };
  if (!response.ok || !data.buy_url) {
    throw new Error(data.message || "购买链接生成失败");
  }
  return data.buy_url;
}

type AppSidebarProps = {
  appUpdate: AppUpdateCheckResult | null;
  appUpdateInstallState: AppUpdateInstallState;
  licenseBusy: boolean;
  licenseCode: string;
  licenseError: string;
  licenseStatus: LicenseActivationStatus | null;
  language: AppLanguage;
  onActivateLicense: () => void;
  onClearLicenseActivation: () => void;
  onEnvView: () => void;
  onGatewayView: () => void;
  onLicenseCodeChange: (value: string) => void;
  onSubscriptionProxyView: () => void;
  onLanguageChange: (language: AppLanguage) => void;
  onSettingsBackdropClick: () => void;
  onSettingsToggle: () => void;
  onTargetSelect: (target: TargetKey) => void;
  onUpdateClick: (event?: MouseEvent<HTMLElement>) => void;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
  settingsPopoverOpen: boolean;
  settingsPopoverStyle: CSSProperties;
  target: TargetKey;
  view: string;
};

export function AppSidebar({
  appUpdate,
  appUpdateInstallState,
  licenseBusy,
  licenseCode,
  licenseError,
  licenseStatus,
  language,
  onActivateLicense,
  onEnvView,
  onGatewayView,
  onLicenseCodeChange,
  onSubscriptionProxyView,
  onLanguageChange,
  onSettingsBackdropClick,
  onSettingsToggle,
  onTargetSelect,
  onUpdateClick,
  settingsButtonRef,
  settingsPopoverOpen,
  settingsPopoverStyle,
  target,
  view,
}: AppSidebarProps) {
  const licenseActivated = Boolean(licenseStatus?.activated);
  const text = settingsText(language);
  const brandLicenseBadgeText = licenseBrandBadgeText(licenseStatus, language);
  const licenseMenuLocked = showLicenseControls && licenseStatus?.access_allowed === false;
  const updateInstallBusy = isAppUpdateInstallBusy(appUpdateInstallState);
  const updateButtonLabel = appUpdateInstallButtonLabel(appUpdateInstallState);
  const [purchaseLinkBusy, setPurchaseLinkBusy] = useState(false);
  const [purchaseLinkError, setPurchaseLinkError] = useState("");
  const [appVersion, setAppVersion] = useState("");
  useEffect(() => {
    let disposed = false;
    void getVersion()
      .then((version) => {
        if (!disposed) setAppVersion(version);
      })
      .catch(() => {
        if (!disposed) setAppVersion("");
      });
    return () => {
      disposed = true;
    };
  }, []);
  async function onPurchaseLicenseClick() {
    setPurchaseLinkBusy(true);
    setPurchaseLinkError("");
    try {
      const url = await createLicensePurchaseSession();
      await openExternalUrl(url);
    } catch (error) {
      setPurchaseLinkError(error instanceof Error ? error.message : String(error));
    } finally {
      setPurchaseLinkBusy(false);
    }
  }
  return (
    <>
      <aside className="ccr-sidebar">

        <div className="ccr-sidebar-brand">
          <strong>Switch++</strong>
          {showLicenseControls && brandLicenseBadgeText ? (
            <span className="ccr-sidebar-license-badge">{brandLicenseBadgeText}</span>
          ) : null}
        </div>

        {appUpdate?.has_update ? (
          <button
            type="button"
            className={"ccr-sidebar-update-indicator" + (updateInstallBusy ? " busy" : "")}
            aria-label={updateButtonLabel}
            title={appUpdateInstallState.message || appUpdate.message || "发现新版本"}
            onClick={onUpdateClick}
            disabled={updateInstallBusy}
          >
            <UpdateAvailableIcon className="h-4 w-4" weight="fill" />
            <span className="ccr-sidebar-update-label">{updateButtonLabel}</span>
          </button>
        ) : null}

        <div className="ccr-sidebar-menu">
          <div className="ccr-sidebar-section-head">
            <span className="ccr-sidebar-section-label">应用</span>
          </div>
          <nav className="ccr-target-nav">
            {visibleTargetOptions.map((option) => {
              const isActive =
                option.key === target &&
                !["env", "gateway", "memory", "mcp", "subscription_proxy"].includes(view);
              const isDisabled = option.disabled || licenseMenuLocked;
              return (
                <button
                  key={option.key}
                  className={isActive ? "ccr-target-btn active" : "ccr-target-btn"}
                  onClick={() => {
                    if (isDisabled) return;
                    onTargetSelect(option.key);
                  }}
                  disabled={isDisabled}
                  aria-label={option.title}
                  title={licenseMenuLocked ? "试用已结束，请先激活。" : option.disabled ? option.disabledReason : option.summary}
                  type="button"
                >
                  <span className="ccr-target-btn-icon ccr-target-logo-frame">
                    <TargetLogo src={option.logo} />
                  </span>
                  <span className="ccr-target-btn-label">{option.title}</span>
                  <span className="ccr-target-btn-badge">{option.badge}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="ccr-sidebar-bottom">
          <div className="ccr-sidebar-section-head">
            <span className="ccr-sidebar-section-label">工具</span>
          </div>
          <nav className="ccr-sidebar-tool-nav" aria-label="工具">
            <button
              className={"ccr-target-btn" + (view === "gateway" ? " active" : "")}
              disabled={licenseMenuLocked}
              onClick={() => {
                if (licenseMenuLocked) return;
                onGatewayView();
              }}
              aria-label="兼容网关"
              title={licenseMenuLocked ? "试用已结束，请先激活。" : "兼容网关"}
              type="button"
            >
              <span className="ccr-target-btn-icon ccr-target-logo-frame ccr-env-nav-icon">
                <LayersIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">兼容网关</span>
            </button>
            <button
              className={"ccr-target-btn" + (view === "subscription_proxy" ? " active" : "")}
              disabled={licenseMenuLocked}
              onClick={() => {
                if (licenseMenuLocked) return;
                onSubscriptionProxyView();
              }}
              aria-label="订阅代理"
              title={licenseMenuLocked ? "试用已结束，请先激活。" : "订阅代理"}
              type="button"
            >
              <span className="ccr-target-btn-icon ccr-target-logo-frame ccr-env-nav-icon">
                <SubscriptionProxyIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">订阅代理</span>
            </button>
            <button
              className={"ccr-target-btn" + (view === "env" ? " active" : "")}
              disabled={licenseMenuLocked}
              onClick={() => {
                if (licenseMenuLocked) return;
                onEnvView();
              }}
              aria-label="环境检查"
              title={licenseMenuLocked ? "试用已结束，请先激活。" : "环境检查"}
              type="button"
            >
              <span className="ccr-target-btn-icon ccr-target-logo-frame ccr-env-nav-icon">
                <ShieldCheckIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">环境检查</span>
            </button>

            <button
              ref={settingsButtonRef}
              type="button"
              className="ccr-target-btn ccr-sidebar-settings-toggle"
              aria-label="设置"
              aria-expanded={settingsPopoverOpen}
              aria-haspopup="dialog"
              title="设置"
              onClick={onSettingsToggle}
            >
              <span className="ccr-target-btn-icon ccr-target-logo-frame ccr-env-nav-icon">
                <SettingsIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">设置</span>
            </button>
          </nav>
        </div>
      </aside>

      {settingsPopoverOpen ? (
        <div className="ccr-settings-popover-layer" style={settingsPopoverStyle}>
          <button
            type="button"
            className="ccr-settings-popover-backdrop"
            aria-label={text.close}
            onClick={onSettingsBackdropClick}
          />
          <aside className="ccr-settings-popover" role="dialog" aria-label={text.settings}>
            <div className="ccr-settings-language-options" role="radiogroup" aria-label={text.interfaceLanguage}>
              {([
                ["zh", "中文"],
                ["en", "English"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={"ccr-settings-language-option" + (language === value ? " active" : "")}
                  role="radio"
                  aria-checked={language === value}
                  onClick={() => onLanguageChange(value)}
                >
                  <span data-translation-skip-text="true">{label}</span>
                </button>
              ))}
            </div>
            {showLicenseControls ? (
              <div className="ccr-license-panel">
                <div className="ccr-license-panel-head">
                  <span className="ccr-license-title">
                    <KeyIcon className="h-4 w-4" />
                    {text.activationTitle}
                  </span>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={licenseStatus?.activated ? "success" : licenseStatus?.access_allowed === false ? "danger" : "default"}
                  >
                    {activationStatusText(licenseStatus, language)}
                  </Chip>
                </div>
                {!licenseActivated ? (
                  <form
                    className="ccr-license-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      onActivateLicense();
                    }}
                  >
                    <Input
                      aria-label={text.enterLicenseCode}
                      autoComplete="off"
                      disabled={licenseBusy}
                      placeholder={text.enterLicenseCode}
                      type="password"
                      value={licenseCode}
                      onChange={(event) => onLicenseCodeChange(event.currentTarget.value)}
                    />
                    {licenseError ? <div className="ccr-license-error">{licenseError}</div> : null}
                    {purchaseLinkError ? <div className="ccr-license-error">{purchaseLinkError}</div> : null}
                    <div className="ccr-license-actions">
                      <Button
                        isDisabled={licenseBusy || purchaseLinkBusy}
                        onPress={onPurchaseLicenseClick}
                        size="sm"
                        variant="secondary"
                      >
                        {purchaseLinkBusy ? text.opening : text.buyLicense}
                      </Button>
                      <Button
                        isDisabled={licenseBusy || !licenseCode.trim()}
                        size="sm"
                        type="submit"
                        variant="primary"
                      >
                        {licenseBusy ? text.activating : text.activate}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="ccr-license-account" aria-label={text.licensedUser}>
                    <span className="ccr-license-account-label">{text.licensedUser}</span>
                    <span className="ccr-license-account-value">{licenseStatus?.buyer_email || text.noLicensedUser}</span>
                  </div>
                )}
              </div>
            ) : null}
            <div className="ccr-settings-popover-footer">
              {appVersion ? <span className="ccr-settings-version">{text.currentVersion} {appVersion}</span> : null}
              <a
                className="ccr-settings-official-site-link"
                href={APP_OFFICIAL_SITE_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={language === "en" ? "Open Switch++ website" : "打开 Switch++ 官网"}
                title={text.officialSite}
              >
                {text.officialSite}
              </a>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
