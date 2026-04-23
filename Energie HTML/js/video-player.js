// Lecteur vidéo moderne pour remplacer Flash
class ModernVideoPlayer {
    constructor(container, videoSrc, title, width = 720, height = 576) {
        this.container = container;
        this.videoSrc = videoSrc;
        this.title = title;
        this.width = width;
        this.height = height;
        this.createPlayer();
    }

    createPlayer() {
        // Créer le conteneur vidéo
        const videoContainer = document.createElement('div');
        videoContainer.className = 'modern-video-container';
        videoContainer.style.cssText = `
            max-width: ${this.width}px;
            margin: 20px auto;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        // Créer l'élément vidéo
        const video = document.createElement('video');
        video.controls = true;
        video.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
        `;

        // Créer la source
        const source = document.createElement('source');
        source.src = this.videoSrc;
        source.type = 'video/mp4';

        // Message d'erreur
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
            <div style="padding: 40px; text-align: center; color: white;">
                <h3>${this.title}</h3>
                <p>Vidéo non disponible</p>
                <p style="font-size: 14px; opacity: 0.8;">
                    La vidéo "${this.videoSrc}" n'a pas été trouvée.<br>
                    Veuillez vérifier que le fichier existe dans le dossier correspondant.
                </p>
                <p style="font-size: 12px; margin-top: 20px; opacity: 0.6;">
                    Format supporté : MP4 (H.264)
                </p>
            </div>
        `;

        video.appendChild(source);
        video.appendChild(errorMessage);

        // Ajouter le titre
        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = `<h3 style="margin: 10px; color: #333;">${this.title}</h3>`;

        videoContainer.appendChild(titleDiv);
        videoContainer.appendChild(video);

        // Remplacer l'ancien élément Flash
        if (this.container) {
            this.container.parentNode.replaceChild(videoContainer, this.container);
        }
    }
}

// Fonction pour remplacer automatiquement les lecteurs Flash
function replaceFlashPlayers() {
    // Remplacer les balises object Flash
    const flashObjects = document.querySelectorAll('object[data*=".swf"], embed[src*=".swf"]');
    
    flashObjects.forEach((flashElement, index) => {
        const parent = flashElement.parentNode;
        const rect = flashElement.getBoundingClientRect();
        
        // Extraire le nom du fichier SWF
        let swfFile = '';
        if (flashElement.tagName === 'OBJECT') {
            const movieParam = flashElement.querySelector('param[name="movie"]');
            if (movieParam) swfFile = movieParam.value;
        } else if (flashElement.tagName === 'EMBED') {
            swfFile = flashElement.src;
        }
        
        // Créer un nom de fichier MP4 correspondant
        const mp4File = swfFile.replace(/\.swf$/i, '.mp4');
        const title = swfFile.replace(/^.*[\\\/]/, '').replace(/\.swf$/i, '');
        
        // Créer le lecteur moderne
        const container = document.createElement('div');
        container.id = `video-replacement-${index}`;
        parent.insertBefore(container, flashElement);
        parent.removeChild(flashElement);
        
        new ModernVideoPlayer(container, mp4File, title, rect.width || 720, rect.height || 576);
    });
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    replaceFlashPlayers();
});

// Exporter pour utilisation manuelle
window.ModernVideoPlayer = ModernVideoPlayer;
window.replaceFlashPlayers = replaceFlashPlayers;
