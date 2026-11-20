# Mind a 10 videó (magyar + angol) újragyártása a repó videok/ mappájának AKTUÁLIS fájljaiból. Egyszer futtatandó: a már javított fájlra a csere-ellenőrzés hibát ad.
set -e
D=$(cd "$(dirname "$0")" && pwd); V=${2:-$D/../../../videok}; O=${1:-/tmp/elethu_out}; mkdir -p $O/en
cd $D
python3 v1.py $V/1_Terfogatvaltozo_agyagok_video.html $O/1_Terfogatvaltozo_agyagok_video.html
python3 v2.py $V/2_Roskadekony_talajok_video.html $O/2_Roskadekony_talajok_video.html
python3 v3.py $V/3_Feltoltesek_video.html $O/3_Feltoltesek_video.html
python3 v4.py $V/4_Szerves_talajok_video.html $O/4_Szerves_talajok_video.html
python3 v5.py $V/5_Alapmegerosites_terfogatvaltozo_agyagon_video.html $O/5_Alapmegerosites_terfogatvaltozo_agyagon_video.html
python3 v1.py $V/en/1_Expansive_clays_EN_video.html $O/en/1_Expansive_clays_EN_video.html
python3 v2.py $V/en/2_Collapsible_soils_EN_video.html $O/en/2_Collapsible_soils_EN_video.html
python3 v3.py $V/en/3_Made_ground_EN_video.html $O/en/3_Made_ground_EN_video.html
python3 v4.py $V/en/4_Organic_soils_EN_video.html $O/en/4_Organic_soils_EN_video.html
python3 v5.py $V/en/5_Underpinning_on_expansive_clay_EN_video.html $O/en/5_Underpinning_on_expansive_clay_EN_video.html
python3 grass_lod.py $O/*.html $O/en/*.html
