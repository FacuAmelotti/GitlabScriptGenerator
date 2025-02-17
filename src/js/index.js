document.addEventListener("DOMContentLoaded", function () {
    // Agregar funcionalidad de desplegar información
    const toggles = document.querySelectorAll(".toggle");
    toggles.forEach(button => {
        button.addEventListener("click", function () {
            const desc = this.nextElementSibling;
            if (desc.style.display === "block") {
                desc.style.display = "none";
            } else {
                desc.style.display = "block";
            }
        });
    });

    // Generar script
    document.getElementById("generarScript").addEventListener("click", function () {
        const groupId = document.getElementById("groupId").value;
        const pushAccess = document.getElementById("pushAccess").value;
        const mergeAccess = document.getElementById("mergeAccess").value;
        const branchInput = document.getElementById("branch").value;
        const scriptType = document.getElementById("scriptType").value;
        
        // Procesar ramas
        const branches = branchInput.split(',')
                          .map(b => b.trim())
                          .filter(b => b !== '');

        if (!groupId || branches.length === 0) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        // Generar script según tipo
        let script;
        const extension = scriptType === 'bash' ? 'sh' : 'ps1';
        
        if (scriptType === 'bash') {
            script = `#!/bin/bash

GROUP_ID="${groupId}"
PRIVATE_TOKEN="TU_TOKEN_AQUI"

echo "Aplicando configuraciones para el grupo ID: \$GROUP_ID"

branches=(${branches.map(b => `"${b}"`).join(' ')})

for branch in "\${branches[@]}"; do
    curl --request POST --header "PRIVATE-TOKEN: \$PRIVATE_TOKEN" \\
        --data "name=\$branch&push_access_level=${pushAccess}&merge_access_level=${mergeAccess}" \\
        "https://gitlab.com/api/v4/projects/\$GROUP_ID/protected_branches"
done

echo "Configuración aplicada a las ramas: ${branches.join(', ')}"

# Dev by Facu :)`;
        } else {
            script = `#Requires -Version 5.1

$GROUP_ID = "${groupId}"
$PRIVATE_TOKEN = "TU_TOKEN_AQUI"

Write-Host "Aplicando configuraciones para el grupo ID: \$GROUP_ID"

$branches = @(${branches.map(b => `"${b}"`).join(', ')})

foreach ($branch in \$branches) {
    $body = @{
        name = \$branch
        push_access_level = ${pushAccess}
        merge_access_level = ${mergeAccess}
    }

    Invoke-RestMethod -Uri "https://gitlab.com/api/v4/projects/\$GROUP_ID/protected_branches" \`
        -Method POST \`
        -Headers @{"PRIVATE-TOKEN" = \$PRIVATE_TOKEN} \`
        -Body \$body
}

Write-Host "Configuración aplicada a las ramas: ${branches.join(', ')}"

# Dev by Facu :)`;
        }

        // Crear y descargar el script
        const blob = new Blob([script], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `configuracion_gitlab.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
