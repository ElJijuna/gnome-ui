# @gnome-ui/icons

Framework-agnostic icon definitions for the [gnome-ui](https://github.com/ElJijuna/gnome-ui) design system.

Each icon is a plain JavaScript object (`IconDefinition`) containing SVG path data — no DOM, no React, no styles. UI framework adapters consume this shape to render inline SVGs.

The `Icon` React adapter also accepts icons from [`simple-icons`](https://simpleicons.org/) directly, without any conversion.

[![npm](https://img.shields.io/npm/v/@gnome-ui/icons)](https://www.npmjs.com/package/@gnome-ui/icons)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

```bash
npm install @gnome-ui/icons
```

## Tree-shaking

This package is fully tree-shakeable. Importing a single icon only pulls that icon's module into your bundle — not the entire registry.

```ts
// Only `Add` and `Search` are included in the final bundle
import { Add, Search } from "@gnome-ui/icons";
```

Each icon is also available as a direct sub-path import for bundlers that prefer explicit paths:

```ts
import { Add } from "@gnome-ui/icons/icons";
import { GitHub } from "@gnome-ui/icons/third-party";
```

## Usage

### With `@gnome-ui/react`

```tsx
import { Icon } from "@gnome-ui/react";
import { Search, Settings, GoHome } from "@gnome-ui/icons";

<Icon icon={Search} size="md" aria-label="Search" />
<Icon icon={Settings} size="lg" aria-hidden />
```

### With `simple-icons`

The `Icon` component accepts any `simple-icons` icon directly — no adapter or conversion needed. `simple-icons` is not a dependency of this package; install it separately in your project.

```tsx
import { Icon } from "@gnome-ui/react";
import { siGithub, siNpm } from "simple-icons";

<Icon icon={siGithub} label="GitHub" />
<Icon icon={siNpm} size="lg" label="npm" />
```

You can also pass a plain `{ path }` object for any single-path SVG icon:

```tsx
import { Icon } from "@gnome-ui/react";

<Icon icon={{ path: "M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12..." }} label="My icon" />
// Custom viewBox (defaults to "0 0 24 24"):
<Icon icon={{ path: "M0 0h32v32H0z", viewBox: "0 0 32 32" }} />
```

### Framework-agnostic (raw SVG)

```ts
import { Search } from "@gnome-ui/icons";
import type { IconDefinition } from "@gnome-ui/icons";

function renderIcon(icon: IconDefinition, size = 16) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", icon.viewBox);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "currentColor");

  for (const path of icon.paths) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", path.d);
    if (path.fillRule) el.setAttribute("fill-rule", path.fillRule);
    if (path.clipRule) el.setAttribute("clip-rule", path.clipRule);
    svg.appendChild(el);
  }
  return svg;
}
```

## Types

```ts
/** Icons from @gnome-ui/icons — multi-path, fixed viewBox. */
interface IconDefinition {
  readonly viewBox: string;
  readonly paths: ReadonlyArray<{
    readonly d: string;
    readonly fillRule?: "nonzero" | "evenodd" | "inherit";
    readonly clipRule?: "nonzero" | "evenodd" | "inherit";
    readonly transform?: string;
  }>;
}

/** Single-path icons from simple-icons or any { path } object. */
interface RawPathIconDefinition {
  readonly path: string;
  readonly viewBox?: string; // defaults to "0 0 24 24"
}

/** Union accepted by the Icon component. */
type AnyIconDefinition = IconDefinition | RawPathIconDefinition;
```

## Available icons

Most icons are Adwaita symbolic or Adwaita-style convenience glyphs — monochrome, `currentColor`-based, 16 × 16 viewBox.
Version Control icons follow GitHub Octicons and use a 24 × 24 viewBox.
Adwaita fullcolor assets are not bundled in this package yet; brand icons are listed separately under Third-party.

The full Adwaita symbolic set is exported from both `@gnome-ui/icons` and `@gnome-ui/icons/icons`, alongside the curated convenience names.

### Navigation

| Export | Symbolic name |
|--------|--------------|
| `GoPrevious` | `go-previous-symbolic` |
| `GoNext` | `go-next-symbolic` |
| `GoHome` | `go-home-symbolic` |
| `GoUp` | `go-up-symbolic` |
| `PanDown` | `pan-down-symbolic` |
| `PanUp` | `pan-up-symbolic` |
| `PanStart` | `pan-start-symbolic` |
| `PanEnd` | `pan-end-symbolic` |

### Actions

| Export | Symbolic name |
|--------|--------------|
| `Add` | `list-add-symbolic` |
| `Remove` | `list-remove-symbolic` |
| `Delete` | `edit-delete-symbolic` |
| `Edit` | `document-edit-symbolic` |
| `Copy` | `edit-copy-symbolic` |
| `Paste` | `edit-paste-symbolic` |
| `Cut` | `edit-cut-symbolic` |
| `Undo` | `edit-undo-symbolic` |
| `Redo` | `edit-redo-symbolic` |
| `Save` | `document-save-symbolic` |
| `Document` | Adwaita-style document glyph |
| `DocumentOpen` | `document-open-symbolic` |
| `Close` | `window-close-symbolic` |
| `Search` | `system-search-symbolic` |
| `Refresh` | `view-refresh-symbolic` |
| `Share` | Adwaita-style share glyph |
| `Attachment` | `mail-attachment-symbolic` |

### UI

| Export | Symbolic name |
|--------|--------------|
| `OpenMenu` | `open-menu-symbolic` |
| `ViewMore` | `view-more-symbolic` |
| `ViewSidebar` | `sidebar-show-symbolic` |
| `ViewReveal` | `view-reveal-symbolic` |
| `ViewConceal` | `view-conceal-symbolic` |
| `Settings` | `preferences-system-symbolic` |

### Status

| Export | Symbolic name |
|--------|--------------|
| `Information` | `dialog-information-symbolic` |
| `Warning` | `dialog-warning-symbolic` |
| `Error` | `dialog-error-symbolic` |
| `Check` | `object-select-symbolic` |

### People & Identity

| Export | Symbolic name |
|--------|--------------|
| `Person` | `system-users-symbolic` |
| `Accessibility` | `preferences-desktop-accessibility-symbolic` |

### System & Hardware

| Export | Symbolic name |
|--------|--------------|
| `Applications` | `view-app-grid-symbolic` |
| `Notifications` | Adwaita-style notification glyph |
| `InputMouse` | `input-mouse-symbolic` |
| `InputKeyboard` | `input-keyboard-symbolic` |
| `InputTablet` | `input-tablet-symbolic` |
| `ColorManagement` | `preferences-color-symbolic` |
| `Printer` | `printer-symbolic` |
| `Lock` | `changes-prevent-symbolic` |

### Files & Media

| Export | Symbolic name |
|--------|--------------|
| `Folder` | `folder-symbolic` |
| `Image` | `image-x-generic-symbolic` |

### Misc

| Export | Symbolic name |
|--------|--------------|
| `Star` | `starred-symbolic` |
| `StarOutline` | `non-starred-symbolic` |
| `Heart` | Adwaita-style heart glyph |

### Media

| Export | Symbolic name |
|--------|--------------|
| `MediaPlay` | `media-playback-start-symbolic` |
| `MediaPause` | `media-playback-pause-symbolic` |
| `MediaSkipForward` | `media-skip-forward-symbolic` |
| `MediaSkipBackward` | `media-skip-backward-symbolic` |

### Version Control

| Export | Description |
|--------|-------------|
| `GitCommit` | Commit node on a branch line |
| `GitBranch` | Branch topology |
| `GitCompare` | Compare branches |
| `GitMerge` | Branch merge |
| `GitMergeQueue` | Merge queue |
| `GitFork` | Forked repository topology |
| `GitPullRequest` | Open pull request |
| `GitPullRequestClosed` | Closed pull request |
| `GitPullRequestDraft` | Draft pull request |
| `GitIssueOpened` | Open issue |
| `GitIssueClosed` | Closed issue |
| `GitIssueDraft` | Draft issue |
| `GitIssueReopened` | Reopened issue |
| `GitCodeReview` | Code review |
| `GitDiff` | Diff |
| `GitMilestone` | Milestone |
| `GitProject` | GitHub project |
| `GitWorkflow` | GitHub workflow |
| `GitRepository` | Repository |
| `GitTag` | Tag label |

### Third-party brand icons

Available via `@gnome-ui/icons` or the `@gnome-ui/icons/third-party` sub-path.

| Export | Brand |
|--------|-------|
| `GitHub` | GitHub |
| `GitLab` | GitLab |
| `Bitbucket` | Bitbucket |
| `X` | X (Twitter) |

### Complete icon list

668 icon exports are available from `@gnome-ui/icons`.

| Export | Source |
|--------|--------|
| `GoPrevious` | Navigation |
| `GoNext` | Navigation |
| `GoHome` | Navigation |
| `GoUp` | Navigation |
| `PanDown` | Navigation |
| `PanUp` | Navigation |
| `PanStart` | Navigation |
| `PanEnd` | Navigation |
| `Add` | Actions |
| `Remove` | Actions |
| `Delete` | Actions |
| `Edit` | Actions |
| `Copy` | Actions |
| `Paste` | Actions |
| `Cut` | Actions |
| `Undo` | Actions |
| `Redo` | Actions |
| `Save` | Actions |
| `DocumentOpen` | Actions |
| `Close` | Actions |
| `Search` | Actions |
| `Refresh` | Actions |
| `Share` | Actions |
| `Attachment` | Actions |
| `OpenMenu` | UI |
| `ViewMore` | UI |
| `ViewSidebar` | UI |
| `ViewReveal` | UI |
| `ViewConceal` | UI |
| `Settings` | UI |
| `Information` | Status |
| `Warning` | Status |
| `Error` | Status |
| `Check` | Status |
| `Person` | People & Identity |
| `Accessibility` | People & Identity |
| `Applications` | System & Hardware |
| `Notifications` | System & Hardware |
| `InputMouse` | System & Hardware |
| `InputKeyboard` | System & Hardware |
| `InputTablet` | System & Hardware |
| `ColorManagement` | System & Hardware |
| `Printer` | System & Hardware |
| `Lock` | System & Hardware |
| `Folder` | Files |
| `Document` | Files |
| `Image` | Files |
| `Star` | Misc |
| `StarOutline` | Misc |
| `Heart` | Misc |
| `MediaPlay` | Media |
| `MediaPause` | Media |
| `MediaSkipForward` | Media |
| `MediaSkipBackward` | Media |
| `GitCommit` | Version Control |
| `GitBranch` | Version Control |
| `GitCompare` | Version Control |
| `GitMerge` | Version Control |
| `GitMergeQueue` | Version Control |
| `GitFork` | Version Control |
| `GitPullRequest` | Version Control |
| `GitPullRequestClosed` | Version Control |
| `GitPullRequestDraft` | Version Control |
| `GitIssueOpened` | Version Control |
| `GitIssueClosed` | Version Control |
| `GitIssueDraft` | Version Control |
| `GitIssueReopened` | Version Control |
| `GitCodeReview` | Version Control |
| `GitDiff` | Version Control |
| `GitMilestone` | Version Control |
| `GitProject` | Version Control |
| `GitWorkflow` | Version Control |
| `GitRepository` | Version Control |
| `GitTag` | Version Control |
| `ActionUnavailable` | Full Adwaita Symbolic |
| `AddressBookNew` | Full Adwaita Symbolic |
| `ApplicationExitRtl` | Full Adwaita Symbolic |
| `ApplicationExit` | Full Adwaita Symbolic |
| `AppointmentNew` | Full Adwaita Symbolic |
| `BookmarkNew` | Full Adwaita Symbolic |
| `CallStart` | Full Adwaita Symbolic |
| `CallStop` | Full Adwaita Symbolic |
| `CameraSwitch` | Full Adwaita Symbolic |
| `ChatMessageNew` | Full Adwaita Symbolic |
| `ColorSelect` | Full Adwaita Symbolic |
| `ContactNew` | Full Adwaita Symbolic |
| `DocumentEdit` | Full Adwaita Symbolic |
| `DocumentNew` | Full Adwaita Symbolic |
| `DocumentOpenRecent` | Full Adwaita Symbolic |
| `DocumentPageSetup` | Full Adwaita Symbolic |
| `DocumentPrintPreview` | Full Adwaita Symbolic |
| `DocumentPrint` | Full Adwaita Symbolic |
| `DocumentProperties` | Full Adwaita Symbolic |
| `DocumentRevertRtl` | Full Adwaita Symbolic |
| `DocumentRevert` | Full Adwaita Symbolic |
| `DocumentSaveAs` | Full Adwaita Symbolic |
| `DocumentSave` | Full Adwaita Symbolic |
| `DocumentSend` | Full Adwaita Symbolic |
| `EditClearAll` | Full Adwaita Symbolic |
| `EditClearRtl` | Full Adwaita Symbolic |
| `EditClear` | Full Adwaita Symbolic |
| `EditCopy` | Full Adwaita Symbolic |
| `EditCut` | Full Adwaita Symbolic |
| `EditDelete` | Full Adwaita Symbolic |
| `EditFindReplace` | Full Adwaita Symbolic |
| `EditFind` | Full Adwaita Symbolic |
| `EditPaste` | Full Adwaita Symbolic |
| `EditRedoRtl` | Full Adwaita Symbolic |
| `EditRedo` | Full Adwaita Symbolic |
| `EditSelectAll` | Full Adwaita Symbolic |
| `EditSelect` | Full Adwaita Symbolic |
| `EditUndoRtl` | Full Adwaita Symbolic |
| `EditUndo` | Full Adwaita Symbolic |
| `ErrorCorrect` | Full Adwaita Symbolic |
| `FindLocation` | Full Adwaita Symbolic |
| `FolderNew` | Full Adwaita Symbolic |
| `FontSelect` | Full Adwaita Symbolic |
| `FormatIndentLessRtl` | Full Adwaita Symbolic |
| `FormatIndentLess` | Full Adwaita Symbolic |
| `FormatIndentMoreRtl` | Full Adwaita Symbolic |
| `FormatIndentMore` | Full Adwaita Symbolic |
| `FormatJustifyCenter` | Full Adwaita Symbolic |
| `FormatJustifyFill` | Full Adwaita Symbolic |
| `FormatJustifyLeft` | Full Adwaita Symbolic |
| `FormatJustifyRight` | Full Adwaita Symbolic |
| `FormatTextBold` | Full Adwaita Symbolic |
| `FormatTextDirectionLtr` | Full Adwaita Symbolic |
| `FormatTextDirectionRtl` | Full Adwaita Symbolic |
| `FormatTextDirection` | Full Adwaita Symbolic |
| `FormatTextItalic` | Full Adwaita Symbolic |
| `FormatTextPlaintext` | Full Adwaita Symbolic |
| `FormatTextRich` | Full Adwaita Symbolic |
| `FormatTextStrikethrough` | Full Adwaita Symbolic |
| `FormatTextUnderline` | Full Adwaita Symbolic |
| `GoBottom` | Full Adwaita Symbolic |
| `GoDown` | Full Adwaita Symbolic |
| `GoFirstRtl` | Full Adwaita Symbolic |
| `GoFirst` | Full Adwaita Symbolic |
| `GoJumpRtl` | Full Adwaita Symbolic |
| `GoJump` | Full Adwaita Symbolic |
| `GoLastRtl` | Full Adwaita Symbolic |
| `GoLast` | Full Adwaita Symbolic |
| `GoNextRtl` | Full Adwaita Symbolic |
| `GoPreviousRtl` | Full Adwaita Symbolic |
| `GoTop` | Full Adwaita Symbolic |
| `HelpAbout` | Full Adwaita Symbolic |
| `InsertImage` | Full Adwaita Symbolic |
| `InsertLink` | Full Adwaita Symbolic |
| `InsertObject` | Full Adwaita Symbolic |
| `InsertText` | Full Adwaita Symbolic |
| `ListAdd` | Full Adwaita Symbolic |
| `ListRemoveAll` | Full Adwaita Symbolic |
| `ListRemove` | Full Adwaita Symbolic |
| `MailForwardRtl` | Full Adwaita Symbolic |
| `MailForward` | Full Adwaita Symbolic |
| `MailMarkImportant` | Full Adwaita Symbolic |
| `MailMarkJunk` | Full Adwaita Symbolic |
| `MailMarkNotjunk` | Full Adwaita Symbolic |
| `MailMessageNew` | Full Adwaita Symbolic |
| `MailReplyAllRtl` | Full Adwaita Symbolic |
| `MailReplyAll` | Full Adwaita Symbolic |
| `MailReplySenderRtl` | Full Adwaita Symbolic |
| `MailReplySender` | Full Adwaita Symbolic |
| `MailSendReceive` | Full Adwaita Symbolic |
| `MailSend` | Full Adwaita Symbolic |
| `MarkLocation` | Full Adwaita Symbolic |
| `MediaEject` | Full Adwaita Symbolic |
| `MediaPlaybackPause` | Full Adwaita Symbolic |
| `MediaPlaybackStart` | Full Adwaita Symbolic |
| `MediaPlaybackStop` | Full Adwaita Symbolic |
| `MediaRecord` | Full Adwaita Symbolic |
| `MediaSeekBackwardRtl` | Full Adwaita Symbolic |
| `MediaSeekBackward` | Full Adwaita Symbolic |
| `MediaSeekForwardRtl` | Full Adwaita Symbolic |
| `MediaSeekForward` | Full Adwaita Symbolic |
| `MediaSkipBackwardRtl` | Full Adwaita Symbolic |
| `MediaSkipForwardRtl` | Full Adwaita Symbolic |
| `MediaViewSubtitles` | Full Adwaita Symbolic |
| `ObjectFlipHorizontal` | Full Adwaita Symbolic |
| `ObjectFlipVertical` | Full Adwaita Symbolic |
| `ObjectRotateLeft` | Full Adwaita Symbolic |
| `ObjectRotateRight` | Full Adwaita Symbolic |
| `ObjectSelect` | Full Adwaita Symbolic |
| `ProcessStop` | Full Adwaita Symbolic |
| `SelectionMode` | Full Adwaita Symbolic |
| `SendTo` | Full Adwaita Symbolic |
| `SidebarShowRightRtl` | Full Adwaita Symbolic |
| `SidebarShowRight` | Full Adwaita Symbolic |
| `SidebarShowRtl` | Full Adwaita Symbolic |
| `SidebarShow` | Full Adwaita Symbolic |
| `StarNew` | Full Adwaita Symbolic |
| `SystemLogOutRtl` | Full Adwaita Symbolic |
| `SystemLogOut` | Full Adwaita Symbolic |
| `SystemReboot` | Full Adwaita Symbolic |
| `SystemRun` | Full Adwaita Symbolic |
| `SystemSearch` | Full Adwaita Symbolic |
| `SystemShutdown` | Full Adwaita Symbolic |
| `SystemSwitchUserRtl` | Full Adwaita Symbolic |
| `SystemSwitchUser` | Full Adwaita Symbolic |
| `TabNew` | Full Adwaita Symbolic |
| `ToolsCheckSpelling` | Full Adwaita Symbolic |
| `ValueDecrease` | Full Adwaita Symbolic |
| `ValueIncrease` | Full Adwaita Symbolic |
| `ViewAppGrid` | Full Adwaita Symbolic |
| `ViewContinuous` | Full Adwaita Symbolic |
| `ViewDual` | Full Adwaita Symbolic |
| `ViewFullscreen` | Full Adwaita Symbolic |
| `ViewGrid` | Full Adwaita Symbolic |
| `ViewListBulletRtl` | Full Adwaita Symbolic |
| `ViewListBullet` | Full Adwaita Symbolic |
| `ViewListOrderedRtl` | Full Adwaita Symbolic |
| `ViewListOrdered` | Full Adwaita Symbolic |
| `ViewListRtl` | Full Adwaita Symbolic |
| `ViewList` | Full Adwaita Symbolic |
| `ViewMirror` | Full Adwaita Symbolic |
| `ViewMoreHorizontal` | Full Adwaita Symbolic |
| `ViewPagedRtl` | Full Adwaita Symbolic |
| `ViewPaged` | Full Adwaita Symbolic |
| `ViewPin` | Full Adwaita Symbolic |
| `ViewRefresh` | Full Adwaita Symbolic |
| `ViewRestore` | Full Adwaita Symbolic |
| `ViewSortAscendingRtl` | Full Adwaita Symbolic |
| `ViewSortAscending` | Full Adwaita Symbolic |
| `ViewSortDescendingRtl` | Full Adwaita Symbolic |
| `ViewSortDescending` | Full Adwaita Symbolic |
| `ZoomFitBest` | Full Adwaita Symbolic |
| `ZoomIn` | Full Adwaita Symbolic |
| `ZoomOriginal` | Full Adwaita Symbolic |
| `ZoomOut` | Full Adwaita Symbolic |
| `ApplicationsEngineering` | Full Adwaita Symbolic |
| `ApplicationsGames` | Full Adwaita Symbolic |
| `ApplicationsGraphics` | Full Adwaita Symbolic |
| `ApplicationsMultimedia` | Full Adwaita Symbolic |
| `ApplicationsScience` | Full Adwaita Symbolic |
| `ApplicationsSystem` | Full Adwaita Symbolic |
| `ApplicationsUtilities` | Full Adwaita Symbolic |
| `EmojiActivities` | Full Adwaita Symbolic |
| `EmojiBody` | Full Adwaita Symbolic |
| `EmojiFlags` | Full Adwaita Symbolic |
| `EmojiFood` | Full Adwaita Symbolic |
| `EmojiNature` | Full Adwaita Symbolic |
| `EmojiObjects` | Full Adwaita Symbolic |
| `EmojiPeople` | Full Adwaita Symbolic |
| `EmojiRecent` | Full Adwaita Symbolic |
| `EmojiSymbols` | Full Adwaita Symbolic |
| `EmojiTravel` | Full Adwaita Symbolic |
| `PreferencesOther` | Full Adwaita Symbolic |
| `PreferencesSystem` | Full Adwaita Symbolic |
| `SystemHelp` | Full Adwaita Symbolic |
| `AcAdapter` | Full Adwaita Symbolic |
| `AudioCard` | Full Adwaita Symbolic |
| `AudioHeadphones` | Full Adwaita Symbolic |
| `AudioHeadset` | Full Adwaita Symbolic |
| `AudioInputMicrophone` | Full Adwaita Symbolic |
| `AudioSpeakersRtl` | Full Adwaita Symbolic |
| `AudioSpeakers` | Full Adwaita Symbolic |
| `AuthFace` | Full Adwaita Symbolic |
| `AuthFingerprint` | Full Adwaita Symbolic |
| `AuthSim` | Full Adwaita Symbolic |
| `AuthSmartcard` | Full Adwaita Symbolic |
| `Battery` | Full Adwaita Symbolic |
| `Bluetooth` | Full Adwaita Symbolic |
| `CameraPhoto` | Full Adwaita Symbolic |
| `CameraVideo` | Full Adwaita Symbolic |
| `CameraWeb` | Full Adwaita Symbolic |
| `ColorimeterColorhug` | Full Adwaita Symbolic |
| `ComputerAppleIpad` | Full Adwaita Symbolic |
| `Computer` | Full Adwaita Symbolic |
| `DisplayProjector` | Full Adwaita Symbolic |
| `DriveHarddiskIeee1394` | Full Adwaita Symbolic |
| `DriveHarddiskSolidstate` | Full Adwaita Symbolic |
| `DriveHarddisk` | Full Adwaita Symbolic |
| `DriveHarddiskSystem` | Full Adwaita Symbolic |
| `DriveHarddiskUsb` | Full Adwaita Symbolic |
| `DriveMultidisk` | Full Adwaita Symbolic |
| `DriveOptical` | Full Adwaita Symbolic |
| `DriveRemovableMedia` | Full Adwaita Symbolic |
| `InputDialpad` | Full Adwaita Symbolic |
| `InputGaming` | Full Adwaita Symbolic |
| `InputTouchpad` | Full Adwaita Symbolic |
| `MediaFlash` | Full Adwaita Symbolic |
| `MediaFloppy` | Full Adwaita Symbolic |
| `MediaOpticalBd` | Full Adwaita Symbolic |
| `MediaOpticalCdAudio` | Full Adwaita Symbolic |
| `MediaOpticalCd` | Full Adwaita Symbolic |
| `MediaOpticalDvd` | Full Adwaita Symbolic |
| `MediaOptical` | Full Adwaita Symbolic |
| `MediaRemovable` | Full Adwaita Symbolic |
| `MediaTape` | Full Adwaita Symbolic |
| `MediaZip` | Full Adwaita Symbolic |
| `Modem` | Full Adwaita Symbolic |
| `MultimediaPlayerAppleIpodTouch` | Full Adwaita Symbolic |
| `MultimediaPlayer` | Full Adwaita Symbolic |
| `NetworkCellular` | Full Adwaita Symbolic |
| `NetworkWired` | Full Adwaita Symbolic |
| `NetworkWireless` | Full Adwaita Symbolic |
| `Pda` | Full Adwaita Symbolic |
| `PhoneAppleIphone` | Full Adwaita Symbolic |
| `PhoneOld` | Full Adwaita Symbolic |
| `Phone` | Full Adwaita Symbolic |
| `PrinterNetwork` | Full Adwaita Symbolic |
| `Scanner` | Full Adwaita Symbolic |
| `Tablet` | Full Adwaita Symbolic |
| `Thunderbolt` | Full Adwaita Symbolic |
| `Tv` | Full Adwaita Symbolic |
| `UninterruptiblePowerSupply` | Full Adwaita Symbolic |
| `VideoDisplay` | Full Adwaita Symbolic |
| `VideoJoinedDisplays` | Full Adwaita Symbolic |
| `VideoSingleDisplay` | Full Adwaita Symbolic |
| `EmoteLove` | Full Adwaita Symbolic |
| `FaceAngel` | Full Adwaita Symbolic |
| `FaceAngry` | Full Adwaita Symbolic |
| `FaceConfused` | Full Adwaita Symbolic |
| `FaceCool` | Full Adwaita Symbolic |
| `FaceCrying` | Full Adwaita Symbolic |
| `FaceDevilish` | Full Adwaita Symbolic |
| `FaceEmbarrassed` | Full Adwaita Symbolic |
| `FaceGlasses` | Full Adwaita Symbolic |
| `FaceKiss` | Full Adwaita Symbolic |
| `FaceLaugh` | Full Adwaita Symbolic |
| `FaceMonkey` | Full Adwaita Symbolic |
| `FacePlain` | Full Adwaita Symbolic |
| `FaceRaspberry` | Full Adwaita Symbolic |
| `FaceSad` | Full Adwaita Symbolic |
| `FaceShutmouth` | Full Adwaita Symbolic |
| `FaceSick` | Full Adwaita Symbolic |
| `FaceSmileBig` | Full Adwaita Symbolic |
| `FaceSmile` | Full Adwaita Symbolic |
| `FaceSmirk` | Full Adwaita Symbolic |
| `FaceSurprise` | Full Adwaita Symbolic |
| `FaceTired` | Full Adwaita Symbolic |
| `FaceUncertain` | Full Adwaita Symbolic |
| `FaceWink` | Full Adwaita Symbolic |
| `FaceWorried` | Full Adwaita Symbolic |
| `FaceYawn` | Full Adwaita Symbolic |
| `AccessoriesCalculator` | Full Adwaita Symbolic |
| `AccessoriesCharacterMap` | Full Adwaita Symbolic |
| `AccessoriesDictionary` | Full Adwaita Symbolic |
| `AccessoriesTextEditor` | Full Adwaita Symbolic |
| `AppletsScreenshooter` | Full Adwaita Symbolic |
| `BatteryCautionCharging` | Full Adwaita Symbolic |
| `BatteryEmptyCharging` | Full Adwaita Symbolic |
| `BatteryEmpty` | Full Adwaita Symbolic |
| `BatteryFullCharged` | Full Adwaita Symbolic |
| `BatteryFullCharging` | Full Adwaita Symbolic |
| `BatteryFull` | Full Adwaita Symbolic |
| `BatteryGoodCharging` | Full Adwaita Symbolic |
| `BatteryGood` | Full Adwaita Symbolic |
| `BatteryLowCharging` | Full Adwaita Symbolic |
| `EmblemImportant` | Full Adwaita Symbolic |
| `EmblemSystem` | Full Adwaita Symbolic |
| `GnomePowerManager` | Full Adwaita Symbolic |
| `GoaPanel` | Full Adwaita Symbolic |
| `HelpBrowser` | Full Adwaita Symbolic |
| `HelpContents` | Full Adwaita Symbolic |
| `HelpFaq` | Full Adwaita Symbolic |
| `MultimediaVolumeControl` | Full Adwaita Symbolic |
| `PreferencesColor` | Full Adwaita Symbolic |
| `PreferencesDesktopAccessibility` | Full Adwaita Symbolic |
| `PreferencesDesktopAppearance` | Full Adwaita Symbolic |
| `PreferencesDesktopApps` | Full Adwaita Symbolic |
| `PreferencesDesktopDisplay` | Full Adwaita Symbolic |
| `PreferencesDesktopFont` | Full Adwaita Symbolic |
| `PreferencesDesktopKeyboardShortcuts` | Full Adwaita Symbolic |
| `PreferencesDesktopKeyboard` | Full Adwaita Symbolic |
| `PreferencesDesktopLocale` | Full Adwaita Symbolic |
| `PreferencesDesktopMultitasking` | Full Adwaita Symbolic |
| `PreferencesDesktopRemoteDesktop` | Full Adwaita Symbolic |
| `PreferencesDesktopScreensaver` | Full Adwaita Symbolic |
| `PreferencesDesktopWallpaper` | Full Adwaita Symbolic |
| `PreferencesSystemDetails` | Full Adwaita Symbolic |
| `PreferencesSystemDevices` | Full Adwaita Symbolic |
| `PreferencesSystemNetworkProxy` | Full Adwaita Symbolic |
| `PreferencesSystemNetwork` | Full Adwaita Symbolic |
| `PreferencesSystemNotifications` | Full Adwaita Symbolic |
| `PreferencesSystemParentalControls` | Full Adwaita Symbolic |
| `PreferencesSystemPrivacy` | Full Adwaita Symbolic |
| `PreferencesSystemSearch` | Full Adwaita Symbolic |
| `PreferencesSystemSharing` | Full Adwaita Symbolic |
| `PreferencesSystemTime` | Full Adwaita Symbolic |
| `SystemFileManager` | Full Adwaita Symbolic |
| `SystemSoftwareInstall` | Full Adwaita Symbolic |
| `SystemUsers` | Full Adwaita Symbolic |
| `TextEditor` | Full Adwaita Symbolic |
| `UserInfo` | Full Adwaita Symbolic |
| `UtilitiesTerminal` | Full Adwaita Symbolic |
| `WebBrowser` | Full Adwaita Symbolic |
| `ApplicationCertificate` | Full Adwaita Symbolic |
| `ApplicationRssPlusXml` | Full Adwaita Symbolic |
| `ApplicationXAddon` | Full Adwaita Symbolic |
| `ApplicationXAppliance` | Full Adwaita Symbolic |
| `ApplicationXExecutable` | Full Adwaita Symbolic |
| `ApplicationXFirmware` | Full Adwaita Symbolic |
| `ApplicationXSharedlib` | Full Adwaita Symbolic |
| `AudioXGeneric` | Full Adwaita Symbolic |
| `FontXGeneric` | Full Adwaita Symbolic |
| `ImageXGeneric` | Full Adwaita Symbolic |
| `InodeDirectory` | Full Adwaita Symbolic |
| `PackageXGeneric` | Full Adwaita Symbolic |
| `TextXGeneric` | Full Adwaita Symbolic |
| `VideoXGeneric` | Full Adwaita Symbolic |
| `XOfficeAddressBook` | Full Adwaita Symbolic |
| `XOfficeCalendar` | Full Adwaita Symbolic |
| `XOfficeDocument` | Full Adwaita Symbolic |
| `XOfficeDrawing` | Full Adwaita Symbolic |
| `XOfficePresentation` | Full Adwaita Symbolic |
| `XOfficeSpreadsheet` | Full Adwaita Symbolic |
| `FolderDocuments` | Full Adwaita Symbolic |
| `FolderDownload` | Full Adwaita Symbolic |
| `FolderMusic` | Full Adwaita Symbolic |
| `FolderPictures` | Full Adwaita Symbolic |
| `FolderProjects` | Full Adwaita Symbolic |
| `FolderPublicshare` | Full Adwaita Symbolic |
| `FolderRemote` | Full Adwaita Symbolic |
| `FolderSavedSearch` | Full Adwaita Symbolic |
| `FolderTemplates` | Full Adwaita Symbolic |
| `FolderVideos` | Full Adwaita Symbolic |
| `NetworkServer` | Full Adwaita Symbolic |
| `NetworkWorkgroup` | Full Adwaita Symbolic |
| `StartHere` | Full Adwaita Symbolic |
| `UserBookmarks` | Full Adwaita Symbolic |
| `UserDesktop` | Full Adwaita Symbolic |
| `UserHome` | Full Adwaita Symbolic |
| `UserTrash` | Full Adwaita Symbolic |
| `AirplaneModeDisabled` | Full Adwaita Symbolic |
| `AirplaneMode` | Full Adwaita Symbolic |
| `Alarm` | Full Adwaita Symbolic |
| `AppointmentMissed` | Full Adwaita Symbolic |
| `AppointmentSoon` | Full Adwaita Symbolic |
| `AudioVolumeHighRtl` | Full Adwaita Symbolic |
| `AudioVolumeHigh` | Full Adwaita Symbolic |
| `AudioVolumeLowRtl` | Full Adwaita Symbolic |
| `AudioVolumeLow` | Full Adwaita Symbolic |
| `AudioVolumeMediumRtl` | Full Adwaita Symbolic |
| `AudioVolumeMedium` | Full Adwaita Symbolic |
| `AudioVolumeMutedRtl` | Full Adwaita Symbolic |
| `AudioVolumeMuted` | Full Adwaita Symbolic |
| `AudioVolumeOveramplifiedRtl` | Full Adwaita Symbolic |
| `AudioVolumeOveramplified` | Full Adwaita Symbolic |
| `AuthSimLocked` | Full Adwaita Symbolic |
| `AuthSimMissing` | Full Adwaita Symbolic |
| `AvatarDefault` | Full Adwaita Symbolic |
| `BatteryAction` | Full Adwaita Symbolic |
| `BatteryCaution` | Full Adwaita Symbolic |
| `BatteryLevel0Charging` | Full Adwaita Symbolic |
| `BatteryLevel0PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel0` | Full Adwaita Symbolic |
| `BatteryLevel10Charging` | Full Adwaita Symbolic |
| `BatteryLevel10PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel10` | Full Adwaita Symbolic |
| `BatteryLevel100Charged` | Full Adwaita Symbolic |
| `BatteryLevel100PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel100` | Full Adwaita Symbolic |
| `BatteryLevel20Charging` | Full Adwaita Symbolic |
| `BatteryLevel20PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel20` | Full Adwaita Symbolic |
| `BatteryLevel30Charging` | Full Adwaita Symbolic |
| `BatteryLevel30PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel30` | Full Adwaita Symbolic |
| `BatteryLevel40Charging` | Full Adwaita Symbolic |
| `BatteryLevel40PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel40` | Full Adwaita Symbolic |
| `BatteryLevel50Charging` | Full Adwaita Symbolic |
| `BatteryLevel50PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel50` | Full Adwaita Symbolic |
| `BatteryLevel60Charging` | Full Adwaita Symbolic |
| `BatteryLevel60PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel60` | Full Adwaita Symbolic |
| `BatteryLevel70Charging` | Full Adwaita Symbolic |
| `BatteryLevel70PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel70` | Full Adwaita Symbolic |
| `BatteryLevel80Charging` | Full Adwaita Symbolic |
| `BatteryLevel80PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel80` | Full Adwaita Symbolic |
| `BatteryLevel90Charging` | Full Adwaita Symbolic |
| `BatteryLevel90PluggedIn` | Full Adwaita Symbolic |
| `BatteryLevel90` | Full Adwaita Symbolic |
| `BatteryLow` | Full Adwaita Symbolic |
| `BatteryMissing` | Full Adwaita Symbolic |
| `BluetoothAcquiring` | Full Adwaita Symbolic |
| `BluetoothActive` | Full Adwaita Symbolic |
| `BluetoothDisabled` | Full Adwaita Symbolic |
| `BluetoothDisconnected` | Full Adwaita Symbolic |
| `BluetoothHardwareDisabled` | Full Adwaita Symbolic |
| `CallIncoming` | Full Adwaita Symbolic |
| `CallMissed` | Full Adwaita Symbolic |
| `CallOutgoing` | Full Adwaita Symbolic |
| `CameraDisabled` | Full Adwaita Symbolic |
| `CameraHardwareDisabled` | Full Adwaita Symbolic |
| `ChangesAllow` | Full Adwaita Symbolic |
| `ChangesPrevent` | Full Adwaita Symbolic |
| `ChannelInsecure` | Full Adwaita Symbolic |
| `ChannelSecure` | Full Adwaita Symbolic |
| `ComputerFail` | Full Adwaita Symbolic |
| `ContentLoading` | Full Adwaita Symbolic |
| `DaytimeSunrise` | Full Adwaita Symbolic |
| `DaytimeSunset` | Full Adwaita Symbolic |
| `DialogError` | Full Adwaita Symbolic |
| `DialogInformation` | Full Adwaita Symbolic |
| `DialogPassword` | Full Adwaita Symbolic |
| `DialogQuestion` | Full Adwaita Symbolic |
| `DialogWarning` | Full Adwaita Symbolic |
| `DisplayBrightness` | Full Adwaita Symbolic |
| `FolderDragAccept` | Full Adwaita Symbolic |
| `FolderOpen` | Full Adwaita Symbolic |
| `FolderVisiting` | Full Adwaita Symbolic |
| `ImageLoading` | Full Adwaita Symbolic |
| `ImageMissing` | Full Adwaita Symbolic |
| `KeyboardBrightness` | Full Adwaita Symbolic |
| `LocationServicesActive` | Full Adwaita Symbolic |
| `LocationServicesDisabled` | Full Adwaita Symbolic |
| `MailAttachment` | Full Adwaita Symbolic |
| `MailRead` | Full Adwaita Symbolic |
| `MailRepliedRtl` | Full Adwaita Symbolic |
| `MailReplied` | Full Adwaita Symbolic |
| `MailUnread` | Full Adwaita Symbolic |
| `MediaPlaylistConsecutive` | Full Adwaita Symbolic |
| `MediaPlaylistRepeatSong` | Full Adwaita Symbolic |
| `MediaPlaylistRepeat` | Full Adwaita Symbolic |
| `MediaPlaylistShuffle` | Full Adwaita Symbolic |
| `MicrophoneDisabled` | Full Adwaita Symbolic |
| `MicrophoneHardwareDisabled` | Full Adwaita Symbolic |
| `MicrophoneSensitivityHigh` | Full Adwaita Symbolic |
| `MicrophoneSensitivityLow` | Full Adwaita Symbolic |
| `MicrophoneSensitivityMedium` | Full Adwaita Symbolic |
| `MicrophoneSensitivityMuted` | Full Adwaita Symbolic |
| `NetworkCellular2g` | Full Adwaita Symbolic |
| `NetworkCellular3g` | Full Adwaita Symbolic |
| `NetworkCellular4g` | Full Adwaita Symbolic |
| `NetworkCellular5g` | Full Adwaita Symbolic |
| `NetworkCellularAcquiringRtl` | Full Adwaita Symbolic |
| `NetworkCellularAcquiring` | Full Adwaita Symbolic |
| `NetworkCellularConnected` | Full Adwaita Symbolic |
| `NetworkCellularDisabledRtl` | Full Adwaita Symbolic |
| `NetworkCellularDisabled` | Full Adwaita Symbolic |
| `NetworkCellularEdge` | Full Adwaita Symbolic |
| `NetworkCellularGprs` | Full Adwaita Symbolic |
| `NetworkCellularHardwareDisabledRtl` | Full Adwaita Symbolic |
| `NetworkCellularHardwareDisabled` | Full Adwaita Symbolic |
| `NetworkCellularHspa` | Full Adwaita Symbolic |
| `NetworkCellularNoRouteRtl` | Full Adwaita Symbolic |
| `NetworkCellularNoRoute` | Full Adwaita Symbolic |
| `NetworkCellularOfflineRtl` | Full Adwaita Symbolic |
| `NetworkCellularOffline` | Full Adwaita Symbolic |
| `NetworkCellularSignalExcellentRtl` | Full Adwaita Symbolic |
| `NetworkCellularSignalExcellent` | Full Adwaita Symbolic |
| `NetworkCellularSignalGoodRtl` | Full Adwaita Symbolic |
| `NetworkCellularSignalGood` | Full Adwaita Symbolic |
| `NetworkCellularSignalNoneRtl` | Full Adwaita Symbolic |
| `NetworkCellularSignalNone` | Full Adwaita Symbolic |
| `NetworkCellularSignalOkRtl` | Full Adwaita Symbolic |
| `NetworkCellularSignalOk` | Full Adwaita Symbolic |
| `NetworkCellularSignalWeakRtl` | Full Adwaita Symbolic |
| `NetworkCellularSignalWeak` | Full Adwaita Symbolic |
| `NetworkError` | Full Adwaita Symbolic |
| `NetworkIdle` | Full Adwaita Symbolic |
| `NetworkNoRoute` | Full Adwaita Symbolic |
| `NetworkOffline` | Full Adwaita Symbolic |
| `NetworkReceiveRtl` | Full Adwaita Symbolic |
| `NetworkReceive` | Full Adwaita Symbolic |
| `NetworkTransmitReceive` | Full Adwaita Symbolic |
| `NetworkTransmitRtl` | Full Adwaita Symbolic |
| `NetworkTransmit` | Full Adwaita Symbolic |
| `NetworkVpnAcquiring` | Full Adwaita Symbolic |
| `NetworkVpnDisabled` | Full Adwaita Symbolic |
| `NetworkVpnDisconnected` | Full Adwaita Symbolic |
| `NetworkVpnNoRoute` | Full Adwaita Symbolic |
| `NetworkVpn` | Full Adwaita Symbolic |
| `NetworkWiredAcquiring` | Full Adwaita Symbolic |
| `NetworkWiredDisconnected` | Full Adwaita Symbolic |
| `NetworkWiredNoRoute` | Full Adwaita Symbolic |
| `NetworkWirelessAcquiring` | Full Adwaita Symbolic |
| `NetworkWirelessConnected` | Full Adwaita Symbolic |
| `NetworkWirelessDisabled` | Full Adwaita Symbolic |
| `NetworkWirelessEncrypted` | Full Adwaita Symbolic |
| `NetworkWirelessHardwareDisabled` | Full Adwaita Symbolic |
| `NetworkWirelessHotspot` | Full Adwaita Symbolic |
| `NetworkWirelessNoRoute` | Full Adwaita Symbolic |
| `NetworkWirelessOffline` | Full Adwaita Symbolic |
| `NetworkWirelessSignalExcellent` | Full Adwaita Symbolic |
| `NetworkWirelessSignalGood` | Full Adwaita Symbolic |
| `NetworkWirelessSignalNone` | Full Adwaita Symbolic |
| `NetworkWirelessSignalOk` | Full Adwaita Symbolic |
| `NetworkWirelessSignalWeak` | Full Adwaita Symbolic |
| `NightLightDisabled` | Full Adwaita Symbolic |
| `NightLight` | Full Adwaita Symbolic |
| `NonStarred` | Full Adwaita Symbolic |
| `NotificationsDisabled` | Full Adwaita Symbolic |
| `OrientationLandscapeInverse` | Full Adwaita Symbolic |
| `OrientationLandscape` | Full Adwaita Symbolic |
| `OrientationPortraitLeftRtl` | Full Adwaita Symbolic |
| `OrientationPortraitLeft` | Full Adwaita Symbolic |
| `OrientationPortraitRightRtl` | Full Adwaita Symbolic |
| `OrientationPortraitRight` | Full Adwaita Symbolic |
| `PowerProfileBalanced` | Full Adwaita Symbolic |
| `PowerProfilePerformance` | Full Adwaita Symbolic |
| `PowerProfilePowerSaver` | Full Adwaita Symbolic |
| `PrinterError` | Full Adwaita Symbolic |
| `PrinterPrinting` | Full Adwaita Symbolic |
| `PrinterWarning` | Full Adwaita Symbolic |
| `RotationAllowed` | Full Adwaita Symbolic |
| `RotationLocked` | Full Adwaita Symbolic |
| `ScreenShared` | Full Adwaita Symbolic |
| `SecurityHigh` | Full Adwaita Symbolic |
| `SecurityLow` | Full Adwaita Symbolic |
| `SecurityMediumRtl` | Full Adwaita Symbolic |
| `SecurityMedium` | Full Adwaita Symbolic |
| `SemiStarredRtl` | Full Adwaita Symbolic |
| `SemiStarred` | Full Adwaita Symbolic |
| `SoftwareUpdateAvailable` | Full Adwaita Symbolic |
| `SoftwareUpdateUrgent` | Full Adwaita Symbolic |
| `Starred` | Full Adwaita Symbolic |
| `SystemLockScreen` | Full Adwaita Symbolic |
| `TaskDue` | Full Adwaita Symbolic |
| `TaskPastDue` | Full Adwaita Symbolic |
| `ThunderboltAcquiring` | Full Adwaita Symbolic |
| `TouchDisabled` | Full Adwaita Symbolic |
| `TouchpadDisabled` | Full Adwaita Symbolic |
| `UserAvailable` | Full Adwaita Symbolic |
| `UserAway` | Full Adwaita Symbolic |
| `UserBusy` | Full Adwaita Symbolic |
| `UserIdle` | Full Adwaita Symbolic |
| `UserInvisible` | Full Adwaita Symbolic |
| `UserNotTracked` | Full Adwaita Symbolic |
| `UserOffline` | Full Adwaita Symbolic |
| `UserStatusPending` | Full Adwaita Symbolic |
| `UserTrashFull` | Full Adwaita Symbolic |
| `ViewWrappedRtl` | Full Adwaita Symbolic |
| `ViewWrapped` | Full Adwaita Symbolic |
| `WeatherClearNight` | Full Adwaita Symbolic |
| `WeatherClear` | Full Adwaita Symbolic |
| `WeatherFewCloudsNight` | Full Adwaita Symbolic |
| `WeatherFewClouds` | Full Adwaita Symbolic |
| `WeatherFog` | Full Adwaita Symbolic |
| `WeatherOvercast` | Full Adwaita Symbolic |
| `WeatherSevereAlert` | Full Adwaita Symbolic |
| `WeatherShowersScattered` | Full Adwaita Symbolic |
| `WeatherShowers` | Full Adwaita Symbolic |
| `WeatherSnow` | Full Adwaita Symbolic |
| `WeatherStorm` | Full Adwaita Symbolic |
| `WeatherTornado` | Full Adwaita Symbolic |
| `WeatherWindy` | Full Adwaita Symbolic |
| `CheckboxChecked` | Full Adwaita Symbolic |
| `CheckboxMixed` | Full Adwaita Symbolic |
| `Checkbox` | Full Adwaita Symbolic |
| `FocusLegacySystray` | Full Adwaita Symbolic |
| `FocusTopBar` | Full Adwaita Symbolic |
| `FocusWindows` | Full Adwaita Symbolic |
| `ListDragHandle` | Full Adwaita Symbolic |
| `PanEndRtl` | Full Adwaita Symbolic |
| `PanStartRtl` | Full Adwaita Symbolic |
| `RadioChecked` | Full Adwaita Symbolic |
| `RadioMixed` | Full Adwaita Symbolic |
| `Radio` | Full Adwaita Symbolic |
| `SelectionEndRtl` | Full Adwaita Symbolic |
| `SelectionEnd` | Full Adwaita Symbolic |
| `SelectionStartRtl` | Full Adwaita Symbolic |
| `SelectionStart` | Full Adwaita Symbolic |
| `WindowClose` | Full Adwaita Symbolic |
| `WindowMaximize` | Full Adwaita Symbolic |
| `WindowMinimize` | Full Adwaita Symbolic |
| `WindowNew` | Full Adwaita Symbolic |
| `WindowRestore` | Full Adwaita Symbolic |
| `GitHub` | Third-party brand icons |
| `GitLab` | Third-party brand icons |
| `Bitbucket` | Third-party brand icons |
| `X` | Third-party brand icons |
| `Npm` | Third-party brand icons |

## License

[MIT](../../LICENSE)
