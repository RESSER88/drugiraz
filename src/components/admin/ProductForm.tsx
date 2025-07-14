
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from '@/types';

interface ProductFormProps {
  product: Product;
  onFieldChange: (field: string, value: string) => void;
  onSpecsFieldChange: (field: string, value: string) => void;
}

const ProductForm = ({ product, onFieldChange, onSpecsFieldChange }: ProductFormProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-base sm:text-lg text-stakerpol-navy">Informacje podstawowe</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Model *</label>
          <Input 
            value={product.model} 
            onChange={(e) => onFieldChange('model', e.target.value)} 
            placeholder="np. BT Toyota SWE200D"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Krótki opis</label>
          <Textarea 
            value={product.shortDescription} 
            onChange={(e) => onFieldChange('shortDescription', e.target.value)}
            placeholder="Krótki opis produktu dla klientów"
            rows={3}
            className="w-full"
          />
        </div>
      </div>
      
      <Tabs defaultValue="main" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main">Sekcja główna</TabsTrigger>
          <TabsTrigger value="extended">Sekcja rozwijana</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main" className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg text-stakerpol-navy">Sekcja główna (zawsze widoczna)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Numer seryjny</label>
              <Input 
                value={product.specs.serialNumber || ''} 
                onChange={(e) => onSpecsFieldChange('serialNumber', e.target.value)} 
                placeholder="ABC123456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rok produkcji</label>
              <Input 
                value={product.specs.productionYear} 
                onChange={(e) => onSpecsFieldChange('productionYear', e.target.value)} 
                placeholder="2023"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Udźwig przy podnoszeniu masztu [kg]</label>
              <Input 
                value={product.specs.mastLiftingCapacity || product.specs.capacity || ''} 
                onChange={(e) => onSpecsFieldChange('mastLiftingCapacity', e.target.value)} 
                placeholder="2000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Udźwig przy podnoszeniu wstępnym [kg]</label>
              <Input 
                value={product.specs.preliminaryLiftingCapacity || ''} 
                onChange={(e) => onSpecsFieldChange('preliminaryLiftingCapacity', e.target.value)} 
                placeholder="1800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Godziny pracy [mh]</label>
              <Input 
                value={product.specs.workingHours} 
                onChange={(e) => onSpecsFieldChange('workingHours', e.target.value)} 
                placeholder="3200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Wysokość podnoszenia [mm]</label>
              <Input 
                value={product.specs.liftHeight} 
                onChange={(e) => onSpecsFieldChange('liftHeight', e.target.value)} 
                placeholder="1600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Wysokość konstrukcyjna [mm]</label>
              <Input 
                value={product.specs.minHeight} 
                onChange={(e) => onSpecsFieldChange('minHeight', e.target.value)} 
                placeholder="85"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Wstępne podnoszenie</label>
              <Input 
                value={product.specs.preliminaryLifting} 
                onChange={(e) => onSpecsFieldChange('preliminaryLifting', e.target.value)} 
                placeholder="120 mm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bateria</label>
              <Input 
                value={product.specs.battery} 
                onChange={(e) => onSpecsFieldChange('battery', e.target.value)} 
                placeholder="48V 120Ah z ładowarką 230V"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Stan</label>
              <Input 
                value={product.specs.condition} 
                onChange={(e) => onSpecsFieldChange('condition', e.target.value)} 
                placeholder="Bardzo dobry"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="extended" className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg text-stakerpol-navy">Sekcja rozwijana</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rodzaj napędu</label>
              <Input 
                value={product.specs.driveType} 
                onChange={(e) => onSpecsFieldChange('driveType', e.target.value)} 
                placeholder="Elektryczny"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Maszt</label>
              <Input 
                value={product.specs.mast} 
                onChange={(e) => onSpecsFieldChange('mast', e.target.value)} 
                placeholder="Duplex"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Wolny skok [mm]</label>
              <Input 
                value={product.specs.freeStroke} 
                onChange={(e) => onSpecsFieldChange('freeStroke', e.target.value)} 
                placeholder="150"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Wymiary (długość / szerokość) [mm]</label>
              <Input 
                value={product.specs.dimensions} 
                onChange={(e) => onSpecsFieldChange('dimensions', e.target.value)} 
                placeholder="1900/720"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Koła</label>
              <Input 
                value={product.specs.wheels} 
                onChange={(e) => onSpecsFieldChange('wheels', e.target.value)} 
                placeholder="Poliuretan"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Składany podest dla operatora</label>
              <Input 
                value={product.specs.operatorPlatform} 
                onChange={(e) => onSpecsFieldChange('operatorPlatform', e.target.value)} 
                placeholder="Tak/Nie"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Opcje dodatkowe</label>
              <Input 
                value={product.specs.additionalOptions} 
                onChange={(e) => onSpecsFieldChange('additionalOptions', e.target.value)} 
                placeholder="Platforma operatora, czujniki"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Opis dodatkowy</label>
              <Textarea 
                value={product.specs.additionalDescription} 
                onChange={(e) => onSpecsFieldChange('additionalDescription', e.target.value)} 
                placeholder="Szczegółowy opis dodatkowy produktu. Tekst będzie automatycznie dopasowywany do szerokości okna."
                rows={4}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductForm;
