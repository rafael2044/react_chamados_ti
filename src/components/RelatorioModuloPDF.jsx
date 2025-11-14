import React from 'react';
import Logo from '../assets/Logo.png'
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
  // --- Página e Títulos ---
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  
  // --- Estilo para a Logo ---
  logo: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 60, // Ajuste o tamanho conforme necessário
    height: 60, // Ajuste o tamanho conforme necessário
    objectFit: 'contain', // Garante que a imagem se ajuste sem cortar
  },

  headerSection: {
    marginBottom: 20,
    marginTop: 70, // Espaço para a logo não sobrepor o título
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },

  // --- Layout da Tabela ---
  table: { 
    display: "table",
    width: "100%", 
    borderStyle: "none", 
  },
  
  // --- Linhas da Tabela ---
  tableRow: { 
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', 
    minHeight: 24, 
    alignItems: 'center', 
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },

  // --- Cabeçalho da Tabela ---
  tableHeaderRow: {
    flexDirection: "row",
    minHeight: 30,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 2,
    borderBottomColor: '#aaaaaa',
  },
  tableColHeaderName: {
    width: "70%", 
  },
  tableColHeaderQty: {
    width: "30%", 
  },
  tableCellHeader: {
    padding: 8,
    fontSize: 12, 
    fontFamily: 'Helvetica-Bold',
    textAlign: 'left', 
  },
  tableCellHeaderQty: {
    padding: 8,
    fontSize: 12, 
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right', 
  },

  // --- Células de Dados ---
  tableColName: {
    width: "70%",
  },
  tableColQty: {
    width: "30%",
  },
  tableCell: { 
    padding: 8, 
    fontSize: 10,
    textAlign: 'left', 
  },
  tableCellQty: {
    padding: 8, 
    fontSize: 10,
    textAlign: 'right', 
  },

  // --- Linha de Total ---
  tableRowTotal: {
    flexDirection: "row",
    minHeight: 30,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 2,
    borderTopColor: '#aaaaaa',
    marginTop: 5, 
  },
  tableCellTotalLabel: {
    padding: 8, 
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right', 
  },
  tableCellTotalValue: {
    padding: 8, 
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right', 
  },
  
  // --- Rodapé com Paginação e Data de Geração ---
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#888888',
    fontSize: 9, // Reduzimos um pouco o tamanho para o rodapé
    fontFamily: 'Helvetica',
  },
  footerTextLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    textAlign: 'left',
  },
  footerTextRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    textAlign: 'right',
  }
});

const RelatorioModuloPDF = ({ dataInicio, dataFim, dados }) => {
  const dataGeracao = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        
        {/* --- LOGO DA EMPRESA (NOVO) --- */}
        {Logo && <Image style={styles.logo} src={Logo} />}

        <View style={styles.headerSection}>
          <Text style={styles.title}>Relatório de Chamados por Modulo</Text>
          {(dataInicio && dataFim) && (
            <Text style={styles.subtitle}>Período: {dataInicio} até {dataFim}</Text>
          )}
        </View>

        {/* --- TABELA --- */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed> 
            <View style={styles.tableColHeaderName}>
              <Text style={styles.tableCellHeader}>Modulo</Text>
            </View>
            <View style={styles.tableColHeaderQty}>
              <Text style={styles.tableCellHeaderQty}>Quant. Chamados</Text>
            </View>
          </View>

          {dados?.map((modulo, index) => (
            <View 
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowEven 
              ]} 
              key={modulo.nome || index} // Usar key mais robusta
              wrap={false}
            >
              <View style={styles.tableColName}>
                <Text style={styles.tableCell}>{modulo.nome}</Text>
              </View>
              <View style={styles.tableColQty}>
                <Text style={styles.tableCellQty}>{modulo.total}</Text>
              </View>
            </View>
          ))}
          
          <View style={styles.tableRowTotal} wrap={false}>
            <View style={styles.tableColName}>
              <Text style={styles.tableCellTotalLabel}>TOTAL</Text>
            </View>
            <View style={styles.tableColQty}>
              <Text style={styles.tableCellTotalValue}>
                {dados?.reduce((sum, modulo) => sum + modulo.total, 0)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* --- RODAPÉ COM PAGINAÇÃO E DATA DE GERAÇÃO (ATUALIZADO) --- */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerTextLeft}>
            Gerado em: {dataGeracao}
          </Text>
          <Text 
            style={styles.footerTextRight} 
            render={({ pageNumber, totalPages }) => (
              `Página ${pageNumber} de ${totalPages}`
            )} 
          />
        </View>
        
      </Page>
    </Document>
  );
};

export default RelatorioModuloPDF;