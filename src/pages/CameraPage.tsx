import { useState, useRef, useEffect, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import { IconButton, Box } from '@mui/material';
import { PhotoCamera, FlipCameraIos, Collections, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CameraContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000',
  display: 'flex',
  flexDirection: 'column',
});

const VideoPreview = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: 'max(env(safe-area-inset-top), 20px)',
  right: 'max(env(safe-area-inset-right), 20px)',
  color: 'white',
});

const GalleryPreview = styled('img')({
  width: 60,
  height: 60,
  borderRadius: 8,
  objectFit: 'cover',
  position: 'absolute',
  bottom: 'calc(max(env(safe-area-inset-bottom), 40px) + 10px)',
  left: 'max(env(safe-area-inset-left), 40px)',
});

const ControlsContainer = styled(Box)({
  position: 'absolute',
  bottom: 'max(env(safe-area-inset-bottom), 40px)',
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const GalleryButton = styled(IconButton)({
  width: 60,
  height: 60,
  position: 'absolute',
  bottom: 'calc(max(env(safe-area-inset-bottom), 40px) + 10px)',
  left: 'max(env(safe-area-inset-left), 40px)',
  color: 'white',
  backgroundColor: 'rgba(51, 51, 51, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(51, 51, 51, 0.9)',
  },
});

// 添加平台检测工具函数
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// 添加拍照按钮的样式组件
const ShutterButton = styled(IconButton)({
  width: 80,
  height: 80,
  padding: 0,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '6px solid white',
    borderRadius: '50%',
    boxSizing: 'border-box',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 'calc(100% - 20px)',
    height: 'calc(100% - 20px)',
    backgroundColor: 'white',
    borderRadius: '50%',
  },
  '&:active::after': {
    width: 'calc(100% - 24px)',
    height: 'calc(100% - 24px)',
  },
});

export default function CameraPage() {
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
        streamRef.current?.removeTrack(track);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      const video = videoRef.current;
      video.srcObject = null;
      video.load();
    }
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    // 确保相机停止后再导航
    setTimeout(() => {
      navigate(-1);
    }, 100);
  }, [navigate, stopCamera]);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        
        // 确保组件仍然挂载
        if (mounted && videoRef.current) {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
        } else {
          // 如果组件已卸载，立即停止相机
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error('相机访问失败:', err);
      }
    }
    
    startCamera();

    // 清理函数
    return () => {
      mounted = false;
      stopCamera();
    };
  }, [stopCamera]);

  // 监听页面可见性变化
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        stopCamera();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stopCamera]);

  const handleTakePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      if (isIOS) {
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        navigate(`/analysis?input=${encodeURIComponent(imageData)}`);
      } else {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/jpeg', 0.8);
        });

        const imageUrl = URL.createObjectURL(blob);
        stopCamera();
        navigate(`/analysis?input=${encodeURIComponent(imageUrl)}`);
      }
    } catch (error) {
      console.error('拍照失败:', error);
      alert('拍照失败，请重试');
    }
  };

  const handleSelectPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    // 处理文件选择
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          alert('请选择图片文件');
          return;
        }
        
        // 检查文件大小（例如限制为 10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert('图片大小不能超过10MB');
          return;
        }

        try {
          // 为 iOS 设备特别处理
          if (isIOS) {
            const reader = new FileReader();
            reader.onload = function(e) {
              const base64Data = e.target?.result as string;
              // 停止相机
              stopCamera();
              // 导航到分析页面，使用 base64 数据
              navigate(`/analysis?input=${encodeURIComponent(base64Data)}`);
            };
            reader.onerror = function(error) {
              console.error('读取文件失败:', error);
              alert('读取图片失败，请重试');
            };
            reader.readAsDataURL(file);
          } else {
            // 非 iOS 设备使用 Blob URL
            const url = URL.createObjectURL(file);
            // 停止相机
            stopCamera();
            // 导航到分析页面
            navigate(`/analysis?input=${encodeURIComponent(url)}`);
          }
        } catch (error) {
          console.error('处理图片失败:', error);
          alert('处理图片失败，请重试');
        }
      }
    };

    // 处理可能的错误
    input.onerror = (error) => {
      console.error('选择图片失败:', error);
      alert('选择图片失败，请重试');
    };
    
    // 触发文件选择
    try {
      input.click();
    } catch (error) {
      console.error('打开相册失败:', error);
      alert('打开相册失败，请检查权限设置');
    }
  };

  return (
    <CameraContainer>
      <VideoPreview ref={videoRef} autoPlay playsInline muted />
      
      <CloseButton onClick={handleClose}>
        <Close />
      </CloseButton>
      
      <ControlsContainer>
        <ShutterButton onClick={handleTakePhoto}>
          {/* 移除 PhotoCamera 图标 */}
        </ShutterButton>
      </ControlsContainer>

      {lastPhoto ? (
        <GalleryPreview 
          src={lastPhoto} 
          onClick={handleSelectPhoto}
        />
      ) : (
        <GalleryButton onClick={handleSelectPhoto}>
          <Collections sx={{ width: 24, height: 24 }} />
        </GalleryButton>
      )}
    </CameraContainer>
  );
} 