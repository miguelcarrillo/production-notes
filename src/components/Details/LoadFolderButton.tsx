import React, { useRef } from "react";
import { useProductionStore } from "../../stores/productionStore";
import { isDirectoryPickerSupported } from "../../utils/localFiles";

interface LoadFolderButtonProps {
  className?: string;
  title?: string;
  children: React.ReactNode;
}

/**
 * Opens the user's audio folder. Uses the File System Access API when the
 * browser supports it (the folder is remembered between sessions) and falls
 * back to a hidden `webkitdirectory` file input everywhere else.
 */
export const LoadFolderButton: React.FC<LoadFolderButtonProps> = ({
  className,
  title,
  children,
}) => {
  const loadDirectory = useProductionStore((s) => s.loadDirectory);
  const loadDirectoryFromFileList = useProductionStore(
    (s) => s.loadDirectoryFromFileList
  );
  const isScanningFiles = useProductionStore((s) => s.isScanningFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isDirectoryPickerSupported()) {
      void loadDirectory();
    } else {
      inputRef.current?.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) loadDirectoryFromFileList(files);
    // Reset so picking the same folder again still fires onChange.
    event.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isScanningFiles}
        className={className}
        title={title}
      >
        {children}
      </button>
      <input
        ref={(node) => {
          inputRef.current = node;
          // `webkitdirectory` is not in React's typings, so set it directly.
          node?.setAttribute("webkitdirectory", "");
        }}
        type="file"
        multiple
        accept="audio/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />
    </>
  );
};
