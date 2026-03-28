from PIL import Image
import os

fire_dir = 'access/image/fire'
files = ['fire1.png', 'fire2.png', 'fire3.png']

for filename in files:
    path = os.path.join(fire_dir, filename)
    img = Image.open(path)

    # 调整尺寸为 80x80（按钮大小）
    img = img.resize((80, 80), Image.Resampling.LANCZOS)

    # 保存为优化的 PNG
    img.save(path, 'PNG', optimize=True, quality=85)
    print(f'已压缩: {filename}')

print('完成！')
