package controller

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestResolvePluginCtlPath(t *testing.T) {
	path, err := resolvePluginCtlPath("go")
	require.NoError(t, err)
	require.True(t, filepath.IsAbs(path))
	require.FileExists(t, path)
	
	// Check that the base name starts with "pluginctl"
	baseName := filepath.Base(path)
	require.True(t, 
		baseName == "pluginctl.sh" || 
		baseName == "pluginctl.cmd" || 
		baseName == "pluginctl.bat" || 
		baseName == "pluginctl.ps1",
		"expected pluginctl script, got: %s", baseName)
	
	require.Equal(t, "go", filepath.Base(filepath.Dir(path)))
}

func TestResolvePluginCtlPathMissing(t *testing.T) {
	_, err := resolvePluginCtlPath("missing-plugin")
	require.Error(t, err)
	require.ErrorContains(t, err, "plugin launcher not found")
}
